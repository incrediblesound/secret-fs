Secret File System
==================

Secret file system is a terminal program that opens up a shell where you can create directories and save text files. It includes a minimal text editor for creating the files. The file names and contents of the directory tree and all the files contained within it are encrypted.

Step 1: Load a file system.
-----
```shell
node sfs <name> <password>
```
This command will load or create a file system with the name <name> and encrypted using <password>. Note that you can create any number of file systems will the same name so long as they have different passwords. If you try to open a file system with the wrong password, you will create a new empty file system with that name.

Step 2: Use commands to create files and directories.
-----

**mkdir**
```shell
:> mkdir <dirname>
```
Creates a new directory in the current directory with name <dirname>.

**cd**
```shell
:> cd <dirname>
```
Moves up into <dirname> from current directory, or down into parent if <dirname> is "..".

**ls**
```shell
:> ls
```
Lists files and directories in current directory

**touch**
```shell
:> touch <filename>
```
Creates a new file called <filename> and opens it in the text editor.

**open**
```shell
:> open <filename>
```
Opens an existing file in the text editor.

**rm**
```shell
:> rm <dirname|filename>
```
Deletes a file or directory. Deleting a directory will recursively delete all files and directories contained in the deleted directory.
