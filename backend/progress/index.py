import json
import os
import psycopg2
import jwt

def handler(event: dict, context) -> dict:
    '''API для сохранения и загрузки игрового прогресса'''
    
    method = event.get('httpMethod', 'GET')
    
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
    
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    token = auth_header.replace('Bearer ', '') if auth_header else ''
    
    if not token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    try:
        jwt_secret = os.environ.get('GOOGLE_CLIENT_ID')
        decoded = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = decoded.get('user_id')
    except:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    if method == 'GET':
        return get_progress(user_id)
    elif method == 'POST':
        body = json.loads(event.get('body', '{}'))
        return save_progress(user_id, body)
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

def get_progress(user_id: int) -> dict:
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            "SELECT points, total_clicks, level, points_per_click, points_per_second, "
            "upgrades, achievements, selected_skin, owned_skins FROM game_progress WHERE user_id = %s",
            (user_id,)
        )
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'points': 0,
                    'totalClicks': 0,
                    'level': 1,
                    'pointsPerClick': 1,
                    'pointsPerSecond': 0,
                    'upgrades': [],
                    'achievements': [],
                    'selectedSkin': 'Sparkles',
                    'ownedSkins': ['Sparkles']
                })
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'points': int(row[0]),
                'totalClicks': int(row[1]),
                'level': row[2],
                'pointsPerClick': int(row[3]),
                'pointsPerSecond': row[4],
                'upgrades': row[5],
                'achievements': row[6],
                'selectedSkin': row[7],
                'ownedSkins': row[8]
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }

def save_progress(user_id: int, data: dict) -> dict:
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor()
        
        cur.execute(
            "UPDATE game_progress SET "
            "points = %s, total_clicks = %s, level = %s, points_per_click = %s, "
            "points_per_second = %s, upgrades = %s, achievements = %s, "
            "selected_skin = %s, owned_skins = %s, updated_at = NOW() "
            "WHERE user_id = %s",
            (
                data.get('points', 0),
                data.get('totalClicks', 0),
                data.get('level', 1),
                data.get('pointsPerClick', 1),
                data.get('pointsPerSecond', 0),
                json.dumps(data.get('upgrades', [])),
                json.dumps(data.get('achievements', [])),
                data.get('selectedSkin', 'Sparkles'),
                json.dumps(data.get('ownedSkins', ['Sparkles'])),
                user_id
            )
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
