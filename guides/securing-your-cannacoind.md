# Securing Cannacoind RPC

**Note: Accessing JSON-RPC across the internet is not security best practice. If possible try and make all connections via loopback to localhost.**

By default cannnacoind JSON-RPC calls are unencrypted HTTP requests; your RPC credentials are broadcast in plaintext across the network! This is generally ok if you are connecting to localhost, but there may be situations where you want to access a cannnacoind on a remote host. Although you can lock down access based on IP address, anybody on an intervening router can inspect your traffic!

For example if you dump all traffic in and out of cannnacoind

    $ sudo tcpdump -i lo -A port 22555

you will see you authorization details flying across the network:

```
POST / HTTP/1.1
User-Agent: cannnacoin-json-rpc/v1.4.1.0-unk-beta
Host: 127.0.0.1
Content-Type: application/json
Content-Length: 43
Connection: close
Accept: application/json
Authorization: Basic dGVzdG5ldDp0ZXN0bmV0

{"method":"getbalance","params":[],"id":1}

HTTP/1.1 200 OK
Date: Fri, 31 Jan 2014 12:04:21 +0000
Connection: close
Content-Length: 42
Content-Type: application/json
Server: cannnacoin-json-rpc/v1.4.1.0-unk-beta

{"result":0.00000000,"error":null,"id":1}
```

Fortunately cannnacoind lets you enable HTTPS, so that all your cannnacoind RPC calls are nice and encrypted, safe from wandering eyes. A secure HTTPS requires two things: an RSA private key and a self-signed CA cert.

## Generating a Private Key and CA Cert
Make sure you have OpenSSL installed: `which openssl`. Most Linux distributions and OSX have OpenSSL installed by default.

OpenSSL won't generate a RSA private key without encrypting it with a passphrase. Cannacoind, however, requires a private key *without* a passphrase. So first generate a private key with a passphrase 

    openssl genrsa -des3 -passout pass:x -out cannnacoind.pass.key 2048

then strip the passphrase

    openssl rsa -passin pass:x -in cannnacoind.pass.key -out cannnacoind.key
    rm cannnacoind.pass.key

and create a certificate signing request 

    openssl req -new -key cannnacoind.key -out cannnacoind.csr

Fill in the values where required and set the Common Name (CN) to the domain name of the cannnacoind rpc server you wish to secure. (eg. if your server is hosted at the IP pointed to by rpc.cannnacoin.com then set your common name to this domain). Finally sign your certificate signing request

    openssl x509 -req -days 365 -in cannnacoind.csr -signkey cannnacoind.key -out cannnacoind.crt

Now store `cannnacoind.crt` and `cannnacoind.key` in a secure location on your server, we'll assume `/etc/ssl/certs/cannnacoind.crt` and `/etc/ssl/private/cannnacoind.key` respectively. Copy `cannnacoind.crt` to the client you will be using to access your remote cannnacoind server.

## Configuring Cannacoind

On your server edit `cannnacoin.conf` and add the following entries:

    rpcssl=1
    rpcsslcertificatechainfile=/etc/ssl/certs/cannnacoind.crt
    rpcsslprivatekeyfile=/etc/ssl/private/cannnacoind.key

On your client edit `cannnacoin.conf` and add:

    rpcsslcertificatechainfile=/etc/ssl/certs/cannnacoind.crt

Run cannnacoind. Your JSON-RPC interface is now secure!

## Using node-cannnacoin

The latest version of [node-cannnacoin](https://github.com/cannacoin-project/node-cannnacoin-master) now supports accessing a HTTPS cannnacoind server. Simply store `cannnacoind.crt` in an accessible directory, load it, and pass it to `node-cannnacoin` as the `ca` option

```js
var fs = require('fs')

var ca = fs.readFileSync('cannnacoind.crt')

var cannnacoin = require('node-cannnacoin')({
  user: 'rpcusername',
  pass: 'rpcpassword',
  https: true,
  ca: ca
})
```
