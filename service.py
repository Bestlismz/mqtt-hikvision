from flask import Flask, request
import requests

app = Flask(__name__)

@app.route('/api/open/barrierGate', methods=['POST'])
def open_barrier_gate():
    request_url = 'http://192.168.100.105/ISAPI/Parking/channels/1/barrierGate'
    auth = requests.auth.HTTPDigestAuth('admin', 'P@ssword1234')

    # Send the request and receive response
    body = "<?xml version: '1.0' encoding='utf-8'?><BarrierGate><ctrlMode>open</ctrlMode></BarrierGate>"
    response = requests.put(request_url, auth=auth, data=body)

    # Output response content
    print(response.text)

    return "Barrier gate opened"

if __name__ == '__main__':
    app.run(port=8000)
