// Imports
var vscode = require('vscode');
var net = require('net');
var fs = require('fs');
var os = require('os');

// We create a MEL socket and use it to execute both Python and MEL commands.
// Commands executed in the Python commandport do not share variables with the
// rest of the Maya Python runtime, but the python() command inside MEL behaves
// as you expect.
var socketMel;

// Hostname and port can be configured if you wish to use other ports or remote servers.
var mayahost='localhost';
var melPort=4434;

// Temporary files where script commands are transferred to Maya.
// If vscode makes the 'tmp' module available, we could replace this:
// var tmp = require('tmp');
// var tmpfile = tmp.fileSync({ mode: 0644, prefix: 'mayaport-', postfix: '.py' });
const tmp_loc = os.tmpdir().toString().replace(/\\/g, "/") + '/';
var tmpnum = Math.round(Math.random() * 10000);
function tmp_filename(tmpnum) {
    return tmp_loc + "mayafiletmp" + tmpnum + ".py";
}


// Escape Python code to embed in a MEL string
escapePythonForMEL = function(pycmd) {
   return pycmd.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

// Create a Maya Output log channel
var outputChannel = vscode.window.createOutputChannel('Maya Output');
outputChannel.show();
function writeOutput(socketdata) {
    var lines = socketdata.toString().split("\n");
    lines.forEach(line => {
        if (line.length > 1) { outputChannel.appendLine(line); }
    });
}

function getTextSelection() {
    var editor = vscode.window.activeTextEditor;
    var selection = editor.selection;
    if (selection.isEmpty) {
        return editor.document.getText();
    }
    else {
        return editor.document.getText(selection);
    }
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function sendMELCommand(cmd) {
    // Could add safety checks, debugging etc in this function
    socketMel.write(cmd);
    socketMel.write('\n');
}

// Primary activation command
function activate(context) {

    /// Register commands
    var disposable = vscode.commands.registerCommand('mayaport.openMayaPort', function ()
    {
        // Setup custom ports
        var config=vscode.workspace.getConfiguration('mayaport');
        if(config.has("melPortID")) {
            melPort=config.get("melPortID");
        }
         if(config.has("mayahost")) {
            mayahost=config.get("mayahost");
        }

        // Connect to MEL commandport and set up event handlers
        socketMel = net.createConnection(melPort, mayahost);
        socketMel.on('error', function(error) {
            var errorMsg = "Unable to connect to port " + melPort + " on Host " + mayahost +" in maya for Mel " + error.code;
            vscode.window.showErrorMessage(errorMsg);
        });
        socketMel.on('data', function(data) {
            writeOutput(data);
        });

        writeOutput('MayaPort setup complete.');
    });

    context.subscriptions.push(disposable);



    // This function takes care of wrapping Python commands inside of MEL commands.
    var disposable = vscode.commands.registerCommand('mayaport.sendPythonToMaya', function ()
    {
        var cmdText = getTextSelection();

        // Single line commands return a usable value so skip writing the external file here.
        var num_newlines = (cmdText.match(/\n/g) || []).length;
        if ((num_newlines < 1) && (cmdText.length < 1024)) {
            var MELRunPython = `python("${escapePythonForMEL(cmdText)}");`;
            sendMELCommand(MELRunPython);
        }


        else {
            fs.unlink(tmp_filename(tmpnum), (err) => { if (err) console.log('Could not delete temporary file'); });
            tmpnum += 1;
            var tmp_file = tmp_filename(tmpnum + 1);
            var MELRunPython = `python ("execfile ('${tmp_file}')");`;
            fs.open(tmp_file, 'wx', (err, fd) =>
            {
                if (err) {
                    if (err.code === 'EEXIST') {
                        fs.unlink(tmp_file);
                        fs.writeFileSync(tmp_file, cmdText);
                        sendMELCommand(MELRunPython)
                    }
                    else {
                        writeOutput("Failed to send Python command: " + err.toString());
                    }
                } else {
                    fs.writeSync(fd, cmdText);
                    sendMELCommand(MELRunPython)
                }
            });
        }
    });
    context.subscriptions.push(disposable);


    var disposable = vscode.commands.registerCommand('mayaport.sendMelToMaya', function ()
    {
        var text = getTextSelection();
        sendMELCommand(text)
        // vscode.window.setStatusBarMessage("MEL sent to Maya");
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;



// this method is called when your extension is deactivated
function deactivate() {
    sendMELCommand("cmdFileOutput -closeAll;");
    fs.unlink(tmp_filename(tmpnum), (err) => { if (err) console.log('Could not delete temporary file'); });
    socketMel.close();
}
exports.deactivate = deactivate;
