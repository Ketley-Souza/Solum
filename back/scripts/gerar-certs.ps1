# Gera a CA e o certificado TLS do Postgres em back/certs (ignorado pelo git).
# Uso (na pasta back): powershell -File scripts/gerar-certs.ps1
$certs = Join-Path $PSScriptRoot '..\certs'
New-Item -ItemType Directory -Force $certs | Out-Null
$certs = (Resolve-Path $certs).Path

$cmds = @'
set -e
cd /certs
openssl req -x509 -newkey rsa:4096 -nodes -days 3650 -keyout ca.key -out ca.crt -subj "/CN=Solum Dev CA"
openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj "/CN=localhost"
printf "subjectAltName=DNS:localhost,DNS:db,IP:127.0.0.1\n" > san.ext
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 825 -out server.crt -extfile san.ext
rm server.csr san.ext ca.srl
chmod 644 server.key
'@ -replace "`r", ''

$cmds | docker run --rm -i -v "${certs}:/certs" --entrypoint sh alpine/openssl -s
