# Room Records
- Add Player
    - type (Number): 1
    - playerIp (String)
- Remove Player
    - type: 2
    - playerIp
- Ready
    - type: 3
    - playerIp
- Unready
    - type: 4
    - playerIp
- Game Start
    - type: 5
- Use Card
    - type: 6
    - playerIp
    - cardNo (Number)
    - status (Number):
        - 0 : succeed
        - 1 : failed
        - ( 2 : not your turn ) // not for 
- End Turn
    - type: 7
    - playerIp