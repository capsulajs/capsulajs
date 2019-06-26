
function start(window, capsula){
    console.log("prj1", window, capsula);
setTimeout(() => console.log("prj1", window, capsula),0);
};
capsula.register("prj1", "1.0.0", start);
