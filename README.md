# MayaPort README

MayaPort is a simple extension to allow sending commands directly from Visual Studio Code to Maya. To set it up you must first open a commandPort in maya. This can be done with the following Python code, which uses the default port 4436 for MayaPort. You can use a different port by changing the value in the code snippet and changing the extension variable *mayaport.melPortID*.

```
import maya.cmds as cmds
cmds.commandPort(name=":4436", sourceType="mel", echoOutput=True)
```

To open the commandport at startup automatically, add the code snippet to userSetup.py, which is located in the following folder:

```
Windows: <drive>:\Documents and Settings\<username>\My Documents\maya\<Version>\scripts
Mac OS X: ~/Library/Preferences/Autodesk/maya/<version>/scripts.
Linux: ~/maya/<version>/scripts.
(where ~ is your home folder)
```

If usersetup.py does not exist, you can create it.

If you require a different client machine it is possible to set the host variable and send to another host. In this case the port needs to be explicitly opened in maya as follows passing in the ip address (or hostname if DNS working etc) of the machine.

```
import maya.cmds as cmds
# Open new ports
cmds.commandPort(name="192.168.0.4:4436", sourceType="mel")
```

## Features

You can send both mel and python code via the different commands sendPythonToMaya or sendMelToMaya.

To get started use cmd+shift+p and run mayaPort. This will connect VSCode to Maya sockets and enable sending code snippets.

You can use the commands alt+shift+e or alt+shift+m, which will send code to Maya as Python or MEL respectively. The extension will send the currently selected code, or if nothing is selected, it will send the contents of the current file.

The output from maya will be sent back to the debug console. To enable full logging the commandPort must have the -echoOutput flag set otherwise only the results are shown.

### Keyboard Shortcuts

Use ALT+SHIFT+E to send python code to Maya.
Use ALT+SHIFT+M to send mel code to Maya.

## Source code
Source code can be found on [github](https://github.com/NCCA)

## Requirements

Autodesk Maya (Should work with all version) tested on Maya 2016 Mac and Linux.  

## Extension Settings

To set custom port ID's edit the user settings (File > Preferences (Code > Preferences on Mac)) and add the following key values to override the defaults
```
{
    "mayaport.melPortID": 7005,
    "mayaport.mayahost" : "192.168.0.4"
}
```
and restart the extension. 

## Known Issues

Issues are tracked on the github page [here](https://github.com/NCCA/mayaport/issues)

## Release Notes

### Release 2.0

- **Breaking Change** Use port 4436 instead of 7001 to match MayaCharm.
- **Breaking Change** Update command namespace to "mayaport"  (This breaks older keyboard shortcut settings)
- **Breaking Change** Write large Python commands to external files. Remote Maya connections will no longer work with Python.
- Send Python commands using MEL's python() command instead of opening a Python commandPort.
- Change keyboard shortcuts to send Python/MEL to alt+shift+e / alt+shift+m respectively.

### Release 1.0

First major release complete. The output from maya is now captured and logged to the debug console.

### Release 0.3

Added the ability to specify the host machine for maya. 
Updated the key bidings for Windows as the keys clashed with command palette use.

### Release 0.2
Updated README.md as was ill formated in the store.

## ToDo
* get user feedback and see what else can be added.
* Write a command to send as MEL/Python depending on the current source mode
