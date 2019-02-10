
const config = {

    cert: '',
    key: '',
    servers: [
        {
            id: 1,
            hostname: '0.0.0.0',
            signalServerPort: 3444,
            scheme: [
                {
                    type: 'endpoint',
                    target: 2
                },
            ]
        },
        {
            id: 2,
            hostname: '0.0.0.0',
            signalServerPort: 3445,
            scheme: [
                {
                    type: 'endpoint',
                    target: 1
                },
            ]
        },
    ]

};