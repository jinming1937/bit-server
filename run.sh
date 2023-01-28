#!/bin/bash

echo "try stop the application [analysis]"

pm2 stop analysis

echo "install application recommond package ==============="

yarn install --production=true

echo "install ok =========================================="

pm2 start app.js --name analysis
