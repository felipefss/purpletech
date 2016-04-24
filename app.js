'use strict';

const Hapi = require('hapi');
const Path = require('path');
const Joi = require('joi');
const Conv = require('./conversion');

// Hapi server config
const server = new Hapi.Server();
server.connection({ port: 3000 });

server.register(require('vision'), () => {


    server.views({
        engines: {
            html: require('handlebars')
        },
        path: Path.join(__dirname, 'public')
    });

    server.route({
        method: 'GET',
        path: '/',
        config: {
            handler: (req, reply) => {
                Conv.loadInfoFromFile((err, data) => {
                    let infoObj;
                    if (err) {
                        infoObj = {
                            totalAmount: 0,
                            mostPop: '',
                            totalConversions: 0
                        };
                    } else {
                        infoObj = data;
                    }

                    reply.view('index', {
                        totalAmount: infoObj.totalAmount.toFixed(2),
                        mostPop: infoObj.mostPop,
                        totalConversions: infoObj.totalConversions
                    });
                });
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/convert/{amount}/{currency}',
        handler: (req, reply) => {
            Conv.loadInfoFromFile((err, data) => {
                let infoObj;
                if (err) {
                    infoObj = {
                        totalAmount: 0,
                        mostPop: '',
                        convCur: {},
                        totalConversions: 0
                    };
                } else {
                    infoObj = data;
                }

                infoObj.totalAmount += parseFloat(req.params.amount);
                infoObj.totalConversions++;
                let usedCur = infoObj.convCur;

                if (usedCur.length === 0 || !usedCur.hasOwnProperty(req.params.currency)) {
                    usedCur[req.params.currency] = 1;
                } else {
                    usedCur[req.params.currency]++;
                }

                let max = -1;
                for (let cur in usedCur) {
                    if (usedCur.hasOwnProperty(cur)) {
                        if (usedCur[cur] > max) {
                            max = usedCur[cur];
                            infoObj.mostPop = cur;
                        }
                    }
                }
                Conv.saveInfoToFile(infoObj);

                reply({
                    totalAmount: infoObj.totalAmount.toFixed(2),
                    mostPop: infoObj.mostPop,
                    totalConversions: infoObj.totalConversions
                });
            });
        },
        config: {
            validate: {
                params: {
                    amount: Joi.number(),
                    currency: Joi.string().length(3).uppercase()
                }
            }
        }
    });
    
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
