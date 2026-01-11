import json
import os
import psycopg2
from urllib.parse import urlencode, parse_qs
import urllib.request
import jwt
import time

def handler(event: dict, context) -> dict:
    '''API для авторизации пользователей через Google OAuth'''
    
    method = event.get('httpMethod', 'GET')
    query_params = event.get('queryStringParameters', {}) or {}
    action = query_params.get('action', 'login')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    if action == 'login':
        return handle_login(event)
    elif action == 'callback':
        return handle_callback(event)
    elif action == 'verify':
        return handle_verify(event)
    
    return {
        'statusCode': 404,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'})
    }

def handle_login(event: dict) -> dict:
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    function_url = 'https://functions.poehali.dev/93ced0b1-de92-4eb5-b82f-a45bdb5f5423'
    redirect_uri = f'{function_url}?action=callback'
    
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'openid email profile',
        'access_type': 'offline',
        'prompt': 'consent'
    }
    
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'authUrl': auth_url})
    }

def handle_callback(event: dict) -> dict:
    query_params = event.get('queryStringParameters', {})
    code = query_params.get('code')
    
    if not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'text/html'},
            'body': '<html><body><script>window.close();</script></body></html>'
        }
    
    client_id = os.environ.get('GOOGLE_CLIENT_ID')
    function_url = 'https://functions.poehali.dev/93ced0b1-de92-4eb5-b82f-a45bdb5f5423'
    redirect_uri = f'{function_url}?action=callback'
    
    token_data = {
        'code': code,
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }
    
    try:
        token_request = urllib.request.Request(
            'https://oauth2.googleapis.com/token',
            data=urlencode(token_data).encode(),
            method='POST'
        )
        
        with urllib.request.urlopen(token_request) as response:
            token_response = json.loads(response.read().decode())
        
        id_token = token_response.get('id_token')
        decoded = jwt.decode(id_token, options={"verify_signature": False})
        
        google_id = decoded.get('sub')
        email = decoded.get('email')
        name = decoded.get('name', '')
        
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO users (google_id, email, name, last_login) VALUES (%s, %s, %s, NOW()) "
            "ON CONFLICT (google_id) DO UPDATE SET last_login = NOW(), email = EXCLUDED.email, name = EXCLUDED.name "
            "RETURNING id",
            (google_id, email, name)
        )
        user_id = cur.fetchone()[0]
        
        cur.execute(
            "INSERT INTO game_progress (user_id) VALUES (%s) ON CONFLICT (user_id) DO NOTHING",
            (user_id,)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        jwt_secret = os.environ.get('GOOGLE_CLIENT_ID')
        user_token = jwt.encode({
            'user_id': user_id,
            'google_id': google_id,
            'email': email,
            'exp': int(time.time()) + 30 * 24 * 60 * 60
        }, jwt_secret, algorithm='HS256')
        
        html = f'''
        <html>
        <body>
        <script>
            window.opener.postMessage({{
                type: 'GOOGLE_AUTH_SUCCESS',
                token: '{user_token}'
            }}, '*');
            window.close();
        </script>
        </body>
        </html>
        '''
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/html'},
            'body': html
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'text/html'},
            'body': f'<html><body>Error: {str(e)}<script>setTimeout(() => window.close(), 3000);</script></body></html>'
        }

def handle_verify(event: dict) -> dict:
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'})
        }
    
    try:
        jwt_secret = os.environ.get('GOOGLE_CLIENT_ID')
        decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'valid': True,
                'user_id': decoded.get('user_id'),
                'email': decoded.get('email')
            })
        }
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Token expired'})
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }