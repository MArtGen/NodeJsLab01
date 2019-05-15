const http = require('http');
const fs = require('fs-extra');

const METHODS = {
    POST: 'POST',
    GET: 'GET',
};

const PORT = 2000;
const HOST = '127.0.0.1';
const FILENOTFOUND = "File not found";
const PATH = "./files/";
const LAB = "01";
const VARIANT = "04";
const NAME = "Artsiom";
const ROWLENGHT = 30;

let date = new Date();

let file_name = LAB + '-' +
                VARIANT + '-' + 
                NAME + '-' +
                date.toDateString().replace(/\s+/g, '-') + '.txt';

const server = http.createServer((req, res) => {
    if (req.method === METHODS.GET) {
        if (req.url === '/api/read') {
            return getTodoList(res);
        } 
        else if (req.url === '/api/create') {
            return createTodo(res);
        }
        else if (req.url === '/api/write') {
            return writeTodo(res, generateRow(ROWLENGHT));
        }
        else if (req.url === '/api/delete') {
            return deleteTodo(res);
        };
    } else if (req.method === METHODS.POST) {
        let body = '';
        req.on('data', data => body += data.toString());
        if (req.url === '/api/change') {
            req.on('end', () => writeTodoSym(body, res));
        } else if (req.url === '/api/newrow') {
            req.on('end', () => writeTodoText(body, res));
        };
        res.end("Please сheck the console.");
    };
    return notFoundError(res);;
});

server.listen(PORT, HOST, () => console.log('Running'));

function notFoundError(res) {
    res.end('404 not found');
    console.log("Not found. Please check the request.");
}

function createTodo(res) {
    if (!fs.existsSync(PATH)) fs.mkdirSync(PATH);
    if (!fs.existsSync(PATH + file_name)) {
        fs.closeSync(fs.openSync(PATH + file_name, 'w'));
        res.end(file_name + ' was created');
        console.log(file_name + ' was created');
    }
    else res.end(file_name + ' already exists');
};

function getTodoList(res) {
    if (fs.existsSync(PATH + file_name)) {
        let fileContent = fs.readFileSync(PATH + file_name, 'utf8');
        console.log(fileContent);
        res.end(fileContent);
    }
    else res.end(FILENOTFOUND);
};

function writeTodo(res, some_text) {
    let new_text = {
        text: some_text
    };
    if (fs.existsSync(PATH + file_name)) {
        fs.writeFileSync(PATH + file_name, JSON.stringify(new_text));
        console.log(JSON.stringify(new_text));
        res.end('Something was writen into the file');
        console.log('Something was writen into the file');
    }
    else res.end(FILENOTFOUND);
};

function deleteTodo(res) {
    fs.readdir(PATH, function(err, files) {
        if (err) {
            if (err) throw err;
        }
        else {
            if (!files.length) {
                res.end(FILENOTFOUND);
            }
            else {
                fs.remove(PATH, (err) => {
                    if (err) throw err;
                    res.end('Files were deleted');
                    console.log('Files were deleted.');
                });
            }
        }
    });
};

function writeTodoSym(body, res) {
    let sym = JSON.parse(body);
    if ((typeof sym.symbol !== 'undefined') && 
        (sym.symbol.length === 1)           &&
        (typeof sym.row !== 'undefined')    &&
        (sym.row.length > 0)) {

        if (fs.existsSync(PATH + file_name)) {
            text = JSON.parse(fs.readFileSync(PATH + file_name, 'utf8')).text;
            let n_text = '';
            for (let i=0; i<text.length; i++) {
                if (text[i] == sym.symbol) {
                    n_text += text[i] + sym.row;
                } else n_text += text[i];
            };
            writeTodo(res, n_text);
            console.log("Done");
        } else console.log(FILENOTFOUND);
    } else {
        console.log("Wrong request");
    };
};

function writeTodoText(body, res) {
    let text = JSON.parse(body);
    if ((typeof text.len_row !== 'undefined') && 
        (text.len_row > 0 || text.len_row.length > 0)) {

        let gen_text = generateRow(Number(text.len_row));
        if (fs.existsSync(PATH + file_name)) {
            writeTodo(res, gen_text);
            console.log("Text was added into the file.");
        } else console.log(FILENOTFOUND);
    } else console.log("Text wasn't added into the file. Check the request.");
};

function generateRow(length) {
    let result           = '';
    // Не очень красиво, но зато быстро.
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }