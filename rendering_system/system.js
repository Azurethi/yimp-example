//grab some Yimp helper functions
const { alpha, createLut } = require('../Yimp/src/helpers');

//give lutReplacers a definition for a "FID" function
function FID(index){
    //NOTE: the memory map is read left to right, top to bottom.
    let screen_col = Math.floor(index/20)%10;
    let screen_row = index%10;
    let screen_line = alpha(1, 2*Math.floor(index/200) + (index%20>9?1:0));

    return `${screen_col}${screen_row}${screen_line}`;
}

//Import the main memory lookup table
const LUT = createLut([__dirname, "memory map.xlsx"],{FID}, "map with memory.xlsx");

//function to get screen field given the screens index
function getScreenFriendlyName(index){
    let screen_col = Math.floor(index/10);
    let screen_row = index%10;

    return `S_${screen_col}${screen_row}`;
}

function getScreenFieldName(index){
    //return global field mapped to that screen's friendly name
    return LUT.directLookup[getScreenFriendlyName(index)];
}

//Export the minimum expected structure {sections:[{name:"",content:[...]}]}
module.exports = {
    sections: [
        {
            name: "renderer yolol",
            content:[
                {
                    label: `rendering chip`,
                    type: "yolol_chip",
                    code: `${__dirname}/renderer.yasm`,
                    num: 100,
                    templates: [
                        //This replacer will swap out "_00" with the desired fields in the memory map (ending with "_99")
                        //These templates are executed in order, so this will happen before the lookup table below
                        {find: /_00/g, lines: "all", note:"Next renderer", replace: (chip)=>{
                            let screen_row = Math.floor(chip/10);
                            let screen_col = chip%10;
                            return `_${screen_row}${screen_col}`;
                        }},

                        //give each chip it's own id
                        {find: /CHIP_NUM/g, lines: "all", note:"chip number", replace: (chip)=>(`${chip}`)},

                        //Add the memory map lookup table to this chip definition's templates list
                        ...LUT.templates
                    ],
                }
            ]
        },
        {
            name: "frame buffer",
            content: [
                {
                    type: "memory_chip",
                    //since each framebuffer field starts with FB_, they'll all be in the FB namespace
                    fields: LUT.namespaces["FB"].map(framebuffer=>(framebuffer.replacement)),
                    
                    //Set their initial values to their friendly name without the "FB_"
                    values: LUT.namespaces["FB"].map(framebuffer=>(framebuffer.stump)),  //could also do framebuffer.full if you want the FB
                    num : 1,
                }
            ]
        },
        {
            name: "screen",
            content: [
                {
                    type: "device",
                    name: "text panel",
                    pages: 1,
                    num: 10*10,
                    field_generators:[ getScreenFieldName ],
                }
            ]
        }
    ]
}
