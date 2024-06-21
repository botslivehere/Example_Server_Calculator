const express = require("express");
const {Liquid} = require("liquidjs");
const fs = require('fs');

const app = express();
app.use(express.urlencoded({extended: true}));
app.use('/s', express.static('content'));

const engine = new Liquid();

app.engine("liquid",engine.express());
app.set('views', './views');
app.set('view engine', 'liquid');

const operations = [
    {
        key: '+',
        calculate: (val,val2) => val+val2,
    },
    {
        key: '-',
        calculate: (val,val2) => val-val2,
    },
    {
        key: '*',
        calculate: (val,val2) => val*val2,
    },
    {
        key: '/',
        calculate: (val,val2) => val/val2,
    }
];


app.get("/",async(req,res)=>{
    let message;
    let fvalue = req.query.fvalue;
    let value = req.query.value;
    let curSign = req.query.curSign;

    if(req.query.digit){
        value+=req.query.digit;
    }
    else if(req.query.sign){

        if(req.query.sign.toString()==="="){
            if(curSign && value){
                const operation = operations.find(x => x.key == curSign);
                if(operation){
                    value = parseFloat(value);
                    fvalue = parseFloat(fvalue);
                    const result = operation.calculate(fvalue,value);
                
                    const data = {
                        fvalue: fvalue,
                        operation: operation.key,
                        value: value,
                        result: result
                    };
                                
                 await fs.promises.appendFile("result.txt", JSON.stringify(data) + '\n', (err) => {
                        if (err) message="Ошибка при записи операции в файл";
                        else message="";
                    });
                                
                    value=result;
                    fvalue="";
                    curSign="";
                }
            }
        }
        else if((!curSign ||curSign=="") && value){
            curSign=req.query.sign;
            fvalue=value;
            value="";
        }

    }

    res.render('index',{
        item:value,
        sign:operations,
        first:fvalue,
        message: message,
        curSign:curSign,
    });
});

app.get("/result",(req,res)=>{
    let results;
    let message;

    fs.readFile("result.txt", (err, data) => {
        if (err) {
            message="Ошибка при чтении файла";
        } 
        else {
            message="";
            const dataString = data.toString();
            results = dataString.split('\n').filter(Boolean).map(JSON.parse);
        }

        res.render("result",{
            result:results,
            message:message,
        });
    });      
    
});

app.listen(3000,()=>{console.log("server open");})