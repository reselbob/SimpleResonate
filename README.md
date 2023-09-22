# SimpleResonate
The project demonstrates the basics of creating durable promises using the Resonate framework

# How to debug

`Step 1:` Install the Resonate Server on a machine.

---

`Step 2:` Configure the `.env` file, if necessary.

If you are **NOT** running the Resonate Server on a local machine, add the URL that represents the server location on the file `./src/.env`. The example below shows a example `./src/.env`. file.

```bash
SERVER_PORT=8089
RESONATE_BASE_URL=http://192.168.86.37:8001
APP_NAME="SimpleResonate"
```

Also, if you want to have the SimpleResonate web server listen on a port other than 8080, make an entry for `SERVER_PORT` in the `./src/.env`. file as shown above.

If you **ARE** running a local machine and want to use the default settings, delete the `./src/.env` file.

---

`Step 3:` In your IDE, add break points in the source code.

---

`Step 4:` Run your IDE's debugger against `./src/index.ts`

---

`Step 5:` Ping the SimpleResonate web server just to make sure all is well

```bash
curl -X GET http://localhost:8089/ping/bob
```

---

`Step 6:` Execute the following `curl` command to instigate debug activity.

```bash
curl --location 'http://localhost:8089/sayHello/123' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Bob"
}'
```

`Step 7:` Execute the following `curl` command to instigate more debug activity.

```bash
curl --location 'http://localhost:8089/sayGoodbye/456' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Bob"
}'
```
