/*
 * (c) Copyright 2020 Calabrio, Inc.
 * All Rights Reserved. www.calabrio.com LICENSED MATERIALS
 * Property of Calabrio, Inc., Minnesota, USA
 *
 * No part of this publication may be reproduced, stored or transmitted,
 * in any form or by any means (electronic, mechanical, photocopying,
 * recording or otherwise) without prior written permission from Calabrio, Inc.
 */
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
require('dotenv').config();
module.exports = {
    entry: [
        'babel-polyfill',
        'react-hot-loader/patch',
        '/src/index.js'
    ],
    output: {
        path: path.resolve(__dirname + '/static/js'), // Flask expects bundled assets in the static/ directory
        filename: 'bundle.js'
    },
    mode: 'development',
    /* Check for these extensions if none are provided within an import statement */
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss'],
    },
    module: {
        rules: [
            /* Javascript, JSX, TSX */
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            /* CSS and SCSS */
            {
                test: /\.(css|scss)$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            /* SVG */
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            templateContent: ({ htmlWebpackPlugin }) => `
            <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <meta name="theme-color" content="#000000" />
                    <meta
                        name="description"
                        content="Web site created using create-react-app"
                    />
                    <title>React App!</title>
                </head>
                <body>
                    <noscript>You need to enable JavaScript to run this app.</noscript>
                    <div id="root"></div>
                    <script src="/bundle.js"></script>
                </body>
            </html>`,
            filename: 'index.html',
            title: 'QM Toolbox Beta'
        })
    ],
    // devtool: 'cheap-module-source-map',
    devServer: {
        static: {
            directory: path.join(__dirname, 'static'),
        },
        client: {
            overlay: false
        },
        compress: true,
        port: 9000,
        historyApiFallback: true,
        proxy: {
            '/api': {
                target: 'https://p36k4zfbqc.execute-api.us-east-2.amazonaws.com/',
                secure: false,
                changeOrigin: true,
                headers: {
                    Cookie: 'ic_auth_token=' + process.env.IC_AUTH_TOKEN
                }
            },
        },
    },
}