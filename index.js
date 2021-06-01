const YIMP = require('./Yimp')();

//YIMP.watch([__dirname, "rendering_system"], "renderer yolol");
YIMP.whenReady(()=>{
    YIMP.load([__dirname, "rendering_system"]);
    YIMP.section("frame buffer")
    YIMP.listen(40);
})

