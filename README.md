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

The easiest way to install the plugin is by using the **Visual Studio Code Market**. Just type "describeML" in the extension tab, and that's it!

### Manually

Instead, you can install it manually using the packaged release of the plugin in this [repository](https://github.com/SOM-Research/DescribeML) that can be found at the root of the project. 

The file is **DescribeML-0.0.8.vsix**

Open your terminal (or the terminal inside the VSCode) and write this:

```

git clone https://github.com/SOM-Research/DescribeML.git datasets
cd datasets 
code --install-extension DescribeML-0.0.8.vsix
```

<span style="font-size:0.7em;">*Troubles: If you cannot see the syntax highlight in the examples files (p.e. *Melanoma.descml*) as the image below. Please, reload the VSCode editor and write the code --install command again* </span>

Great! That's it.



## Getting Started

1) The first step is to create a *.descml* file

2) The easy way to start using our tool is to use the *preloader data service*,  located at the top left of your editor, clicking at: <img
  src="https://github.com/SOM-Research/DescribeML/blob/main/fileicons/cloud-computing.png?raw=true"
  alt="preloader service"
  title="Optional title"
  style="display: inline-block; margin: 0 auto; width: 40px">

3) Select your dataset file (*.csv*), and the tool will generate a draft of your description file.

4) To help you, look to the [Language Reference Guide](https://github.com/SOM-Research/DescribeML/blob/main/documentation/language-reference-guide.md) and follow the examples in the **examples/evaluation** [folders](https://github.com/SOM-Research/DescribeML/tree/main/examples/evaluation) to get a sense of the tool's possibilities. Take a look at the *Melanoma.descml* file, for example.
5) During the documentation process, hitting CTRL + Space (equivalent in other OS) gives you auto-completion help. In addition, the part marked with the points below gives you hints to complete the documentation, and the outline in the right part shows you the document structure.

<div align="center">

![Autocompletion feature](https://github.com/SOM-Research/DescribeML/blob/main/fileicons/Autcomplete.gif?raw=true)

</div>

6) Once you are happy with your documentation, you can generate HTML documentation by clicking the generator button next to the prealoder service: <img
  src="https://github.com/SOM-Research/DescribeML/blob/main/fileicons/html.png?raw=true"
  alt="HTML generator"
  title="Optional title"
  style="display: inline-block; margin: 0 auto; width: 40px">







For more information, check out the **quick [presentation](https://www.youtube.com/watch?v=Bf3bhWB-UJY) video!**


## Research background

DescribeML is part of an ongoing research project to improve dataset documentation for machine learning. The core of our proposal is a domain-specific language ([preprint here](https://www.researchgate.net/publication/361836238_A_domain-specific_language_for_describing_machine_learning_datasets)) that allows data creators to describe relevant aspects of their data for the machine learning field and beyond. The [Critical Dataset Studios](https://knowingmachines.org/reading-list#dataset_documentation_practices) of the [Knowing Machines](https://knowingmachines.org) project have compiled an excellent list of current documentation practices.

The tool will be presented at the ACM/IEEE 25th International Conference on [Model Driven Engineering Languages and Systems](https://conf.researchr.org/home/models-2022) and a preprint of the tool publication can be seen [here](https://www.researchgate.net/publication/363256430_DescribeML_A_Tool_for_Describing_Machine_Learning_Datasets)


## Contributing

The complete grammar in Extended Backus-Naur form (EBNF) can be seen in **src/language-server/dataset-descriptor.langium**

You may need extra steps to contribute or dive into the plugin or the language. (to match with the exact version of the Langium, the base framework we used)

1 - "npm install" to install dependencies.

2 - Then go to /node_modules folder and delete "langium" and "langium-cli" folder

3 - Copy the folder "langium" and "langium-cli" from folder /packages to /node_modules

4 - Get the folder /packages/langium-vscode and paste it inside your VSCode extension folder (typically <user home>/.vscode/extensions)
  
5 - Install the Langium plugin through the UI of VSCode


### Testing the extensions under the hood

This repo comes with an already built-in config to debug. Just go to Debug in VSCode, and launch the Extension config. Please check your port 6009 is free.
  
For more information about how the framework works and how the language can be extended, please refer to https://github.com/langium/langium or the VSCode extension API documentation https://code.visualstudio.com/api
