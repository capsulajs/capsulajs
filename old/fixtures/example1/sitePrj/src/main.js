import 'capsulajs';

capsula.start({
   name: "prj1",
   version: "1.0.0"
});

capsula.start({
   name: "prj1",
   version: "1.0.0",
   shared: {
      data: "hello"
   }
});