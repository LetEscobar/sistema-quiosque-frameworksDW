from datetime import datetime
from pytz import timezone

FUSO_MS = timezone('America/Campo_Grande')

def agora_local():
    return FUSO_MS.localize(datetime.now())

def para_fuso_local(dt):
    if dt.tzinfo is None:
        from pytz import utc
        dt = utc.localize(dt)
    return dt.astimezone(FUSO_MS)

def parse_datetime_local(valor_str):
    dt_naive = datetime.strptime(valor_str, '%Y-%m-%dT%H:%M')
    return FUSO_MS.localize(dt_naive)
