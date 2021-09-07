# Kebodo | A Custom Keyboard Builder

Kebodo is an open source project licensed under the GNU GPLv2, created by [msfninja](https://github.com/msfninja) and . The project's aim is to provide a seamless and easy to use online utility offering a builder for custom keyboards.

Currently, the original and official project is hosted at http://143.176.32.149/. This repository contains everything necessary for the client-side and server-side application.

<table>
	<tr>
		<th>Table of Contents</th>
	</tr>
	<tr>
		<td>
			<ol>
				<li><a href="#notice">Notice</a></li>
				<li><a href="#"></a></li>
				<li><a href="#"></a></li>
				<li><a href="#"></a></li>
				<li><a href="#"></a></li>
			</ol>
		</td>
	</tr>
</table>

## Notice

The main reason for making Kebodo open source is to let people know how the whole thing works and let them utilize our code techniques and alike, and to eliminate any privacy concerns. Since the server-side and client-side are very interconnected and collaborative, it would make no sense to make only the server-side public and open source, hence this repository contains the frontend part of the project. However, it would not be appreciated if you'd just host a complete identical copy of our project. You are free to use, modify and redistribute the source code as stated in the [license](https://github.com/msfninja/Kebodo/blob/main/LICENSE), but we all know how we feel about plagiarism&mdash;&#128078;.

The original and official project will always be at http://143.176.32.149/, unless we move to another URL and you get the announcement directly from us.

## Installation

To get started, you need to install [npm](https://www.npmjs.com/) onto your system, since the server application is built on the [Node.js framework](https://nodejs.org/). To install npm, run the following:

#### Ubuntu/Debian:

```bash
sudo apt-get update && sudo apt-get install npm
```

After installing npm, you will need to install a few node modules and [nodemon](https://nodemon.io/) that do not come with npm by default.

To install the modules and nodemon, run the following:

```bash
npm install color && npm install ip && npm install -g nodemon
```

Now, clone the [Kebodo repository](https://github.com/msfninja/Kebodo) to your desired directory:

```bash
git clone https://github.com/msfninja/Kebodo.git
```

_(Notice: if you clone the repository into a directory with a restricted mode, you should run the command as a root user)._

## Initiating Server

After cloning the repository, go to the `server` directory, and initiate the server using nodemon with the `--ignore` flag set to `'*.json'`:

```bash
cd Kebodo/server
nodemon server.js --ignore '*.json'
```

_(Notice: if the cloned repository is in a directory with a restricted mode, you should run the command as a root user)._

You will be prompted with the following text asking for a hosting port:

```text
© 2020-2021 Kebodo Server, kbdconsole, created by msfninja
See <project root directory>/README.md for more information, <project root directory>/LICENSE for license

Enter a hosting port [xx/xxx/xxxx]:
```

Enter your desired hosting port, and the server will the server will feedback you. If your entered port was invalid, the application will exit. Type `rs` and press Enter to restart the node application.

If the entered port was valid, the server will run on that port. Go to `<your IP>:<your port>` to see the site working (the server will log the site's address in the console).

## Server Configuration

The behavior of the server or almost anything can all be changed and adjusted in the `Kebodo/config.json` file. This includes setting a default port. To set a predefined default port, open the `config.json` file, and look for these lines:

```json
{
  "default_port": [ false, 80 ]
}
```
The value of the property `"default_port"` is an array. The first element of that array determines whether to prompt for a port each time you initiate the node application. Setting it to `false` will prompt you for a port every time you initiate the node application.

If it's set to `true`, it will use the port defined in the second element of this array instead. If the port defined in the second element of this array is invalid, the application will behave as if the 1 element of this array was set to `false`, thus prompting you for a port every time you initiate the node application.

## Support

We tried to keep not only the `config.json` file, but the whole project's code as semantically clean and clear as possible. But if you have any questions or need help, or you want to suggest something, you can reach us on the `#kbd` channel on the freenode IRC server. You can access it from your own client or from the [freenode webchat](https://webchat.freenode.net/). To join the channel you must be registered and identified.

But please consider reporting all issues/bugs [here](https://github.com/msfninja/Kebodo/issues), and not in the IRC channel.

Good luck and happy coding!
