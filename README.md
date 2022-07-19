# DescribeML
A Visual Studio Code language plugin to describe machine-learning datasets. This plugin helps you define your data's provenance, composition, and social concerns in a standard format.


## Installation 

### Via marketplace

The easiest way to install the plugin is using the **Visual Studio Code Market**. Just, type "describeML" in the extension tab, and that's it!

### Manually

Instead, you can install it manually, using the packaged release of the plugin in this repository that can be found at the root of the project. 

The file is **DescribeML-0.0.2.vsix**

Open your terminal (or the terminal inside the VSCode) and write this:

```
git clone https://github.com/SOM-Research/DescribeML.git datasets

cd datasets 

code --install-extension DescribeML-0.0.2.vsix
```

*Troubles: If you cannot see the syntax highlight in the examples files (p.e. *Melanoma.datadesc*) as the image below. Please, reload the VSCode editor and write the code --install command again*

Great! That's it.

## Usage

To start using our tool, we recommend accessing to the **/examples/evaluation** folder in the repository and open and take a look in some, for example *Melanoma.datadesc* file to see a working example of our preliminary evaluation.

Remember: by default, VSCode gives you auto-completion help by hitting CTRL + Space (or equivalent in MAC)

![Autocompletion feature](fileicons/Autcomplete.gif)

## Contributions

The full grammar in Extended Backus-Naur form (EBNF) can be seen in **src/language-server/dataset-descriptor.langium**

If you want to contribute or dive into the plugin or the language, you may need extra steps. As Langium (the base framework of the plugin) is not stable, there are a few actions we need to do manually.

1 - "npm install" to install dependencies.

2 - Then go to /node_modules folder and delete "langium" and "langium-cli" folder

3 - Copy the folder "langium" and "langium-cli" from folder /packages to /node_modules

4 - Get the folder /packages/langium-vscode and paste it inside your VSCode extension folder (typically <user home>/.vscode/extensions)
  
5 - Install de Langium plugin through the UI of VSCode


## Testing the extensions under the hood

This repo comes with an already built-in config to debug. Just go to Debug in VSCode, and launch the Extension config. Please check your port 6009 are free.
  
For more information about how the framework works and how the language can be extended, please refer to https://github.com/langium/langium or the VSCode extension API documentation https://code.visualstudio.com/api
