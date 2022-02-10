# Dataset-Descriptor
A VSCode plugin to formally describe Datasets. This pluguin guides you using the domain-specific Dataset Description Lanuage for describing existing datasets or requeriments for future datasets


### What we need to do before start

As Langium is not stable, there are few action we need to do manually. 

1 - "npm install" to install dependencies.

2 - Then go to /node_modules folder and delete "langium" and "langium-cli" folder

3 - Copy the folder "langium" and "langium-cli" from folder /packages to /node_modules

4 - Get the folder /packages/langium-vscode and paste it inside your VSCode extension folder (tipically `<user home>/.vscode/extensions`)

5 - Install de Langium plugin thourgh the UI of VSCode


## Test and Debug 

This repo comes with and already built-in config to debug. Just go to Debug in VSCode, launch the Extension config. 

Please refer to the folder /examples to have an example to follow. Copy and paste it in your new Extension Host of VSCode to see the language in action.

Remember: by default VSCode gives you help by hittin CTRL + Space (or equivalent in MAC)



Then Launch the Attach config to enable the debugger. 

Please check your port 6009 are free
