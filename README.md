# SimpleResonate
The project demonstrates the basics of creating durable promises using the Resonate framework

```bash
curl -X GET http://localhost:8089/ping/bob
```

```bash
curl --location 'http://localhost:8089/sayHello/123' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Bob"
}'
```


```bash
curl --location 'http://localhost:8089/sayGoodbye/123' \
--header 'Content-Type: application/json' \
--data '{
    "name": "Bob"
}'
```
