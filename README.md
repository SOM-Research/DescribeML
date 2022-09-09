<div align="center">

# DescribeML ![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/SOM-Research/DescribeML?label=Version&style=for-the-badge)

DescribeML is a VSCode language plugin to describe machine-learning datasets. <br>

Precisely describe your data's provenance, composition, and social concerns in a structured format.

<br>

Make it easy to **reproduce your experiments** to others when you cannot share your data. <br>

Check out a quick presentation of the tool: 

<br>[![Presentation](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=Bf3bhWB-UJY)

</div>

## Installation 

### Via marketplace

The easiest way to install the plugin is using the **Visual Studio Code Market**. Just, type "describeML" in the extension tab, and that's it!

### Manually

Instead, you can install it manually, using the packaged release of the plugin in this [repository](https://github.com/SOM-Research/DescribeML) that can be found at the root of the project. 

The file is **DescribeML-0.0.3.vsix**

Open your terminal (or the terminal inside the VSCode) and write this:

```

git clone https://github.com/SOM-Research/DescribeML.git datasets

cd datasets 



code --install-extension DescribeML-0.0.3.vsix

```

*Troubles: If you cannot see the syntax highlight in the examples files (p.e. *Melanoma.descml*) as the image below. Please, reload the VSCode editor and write the code --install command again*

Great! That's it.

## Usage

To start using our tool, we recommend accessing to the **examples/evaluation** folder in the tool's [repository](https://github.com/SOM-Research/DescribeML), and take a look to the full descriptions examples present there. For example, at the *Melanoma.descml* file.

Check out the **quick [presentation](https://www.youtube.com/watch?v=Bf3bhWB-UJY) video!**

Remember: by default, VSCode gives you auto-completion help by hitting CTRL + Space (or equivalent in MAC)
<div align="center">

![Autocompletion feature](fileicons/Autcomplete.gif)

</div>

## Research background

DescribeML is part of an ongoing research project to improve dataset documentation for machine learning. The core of our proposal is a domain-specific language ([preprint here](https://arxiv.org/pdf/2207.02848.pdf)) that allows data creators to describe relevant aspects of their data for the machine learning field and beyond. The [Critical Dataset Studios](https://knowingmachines.org/reading-list#dataset_documentation_practices) of the [Knowing Machines](https://knowingmachines.org) project have compiled an excellent list of current documentation practices.

The tool will be presentend at the ACM/IEEE 25th International Conference on [Model Driven Engineering Languages and Systems](https://conf.researchr.org/home/models-2022) and a preprint of the tool publication can be seen [here](https://modeling-languages.com/wp-content/uploads/2022/08/2022___MODELS___DescribeML_Tool-10.pdf)


## Contributing

The full grammar in Extended Backus-Naur form (EBNF) can be seen in **src/language-server/dataset-descriptor.langium**

If you want to contribute or dive into the plugin or the language, you may need extra steps. To match with the exact Langium version (the base framework of the plugin)  there are few actions we need to do manually.

1 - "npm install" to install dependencies.

2 - Then go to /node_modules folder and delete "langium" and "langium-cli" folder

3 - Copy the folder "langium" and "langium-cli" from folder /packages to /node_modules

4 - Get the folder /packages/langium-vscode and paste it inside your VSCode extension folder (typically <user home>/.vscode/extensions)
  
5 - Install the Langium plugin through the UI of VSCode


### Testing the extensions under the hood

This repo comes with an already built-in config to debug. Just go to Debug in VSCode, and launch the Extension config. Please check your port 6009 are free.
  
For more information about how the framework works and how the language can be extended, please refer to https://github.com/langium/langium or the VSCode extension API documentation https://code.visualstudio.com/api
