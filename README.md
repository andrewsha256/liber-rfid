# RFID Library

> This is a draft of a future solution for working with RFID devices in libraries.

It is a web application (REST / GraphQL and maybe some UI) for working with RFID devices and tags.

This solution will help to work with RFID technologies via high-level HTTP protocol instead of low-level DLLs and will make easier to add custom logic via plugins extensions.

At first it will operate virtual devices (which is very useful for mocking), but later I plan to add some examples of working with real devices.

Last but not least, it will bypass all the pitfalls that I have encountered over the years working with RFID devices in libraries.

```sh
npm install
npm run test
npm start
```
