"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HintsService = void 0;
/**
 */
class HintsService {
    constructor() {
    }
    populateHints(document, position) {
        const wordRange = document.getWordRangeAtPosition(position);
        const word = document.getText(wordRange);
        switch (word) {
            case "Metadata":
                return `## Metadata
In this section authors are expected to provide the metadata of the dataset
                `;
            case "Dates":
                return "Set the release, published and last updated date in DD-MM-YYYY format";
            case "Citation":
                return "Set the citations of the dataset";
            // Description
            case "Description":
                return `### Description
In this section authors are expected to provide a description of the dataset

#### Purposes:
For what propose was the dataser created?

#### Tasks:
For what tasks this dataset is inteded for

#### Gaps:
Was there specific gap that needed to be filled? Please provide a description
                            `;
            case "Purposes":
                return "For what propose was the dataser created?";
            case "Tasks":
                return "For what tasks this dataset is inteded for";
            case "Gaps":
                return "Was there specific gap that needed to be filled?\nPlease provide a description";
            case "Tags":
                return "Set the tags separated by a whitespace";
            case "Areas":
                return "Set the areas separated by a whitespace";
            // Distribution
            case "Distribution":
                return `## Distribution
In this section authors are expected to indicate the distribution of the dataset

### Licenses: 
Set the licence of the dataset.

## Rights stand-alone:
Choose the level of distribution of the stand-alone data.

## Rights of the models: 
Choose the level of distribution of the models trained with the data.
                        `;
            case "Licences":
                return "If any listed license fill your use-case, please provide a STRING with the description of the license";
            // Applications
            case "Applications":
                return `## Applications 
In this section authors are expected to indicate the recommneded and non-recommneded uses of the dataset

### Benchmarking
If the dataset have been used in the past, authors are expected to indicate the benchmarking results
Models names, and results should be provided (accuracy, precision, recall, F1-score)
                `;
            // Authoring
            case "Authoring":
                return `## Authoring 
In this section authors are expected to indicate who created the dataset and who funded the dataset
Please provide information about the organization grating the work

### Maintenance
Who maintains the dataset, but also the contribution policies, if theere is any erratum, and the data life cycle should be informed in this chapter
            `;
            case "Funders":
                return "Who founded the creation of the dataset?\n2 - If is there any associated grant, please provide the number and the name of the grantor and the gran name and number \n Set a `_` or a `-` as a white spaces in the name e.g: 'John_Smith'? ";
            case "Authors":
                return "Who is the author of the dataset?";
            case "Maintainers":
                return "Who maintan the dataset? How can be contacted?";
            // Composition
            case "Composition":
                return `## Composition 
Please provide information about the composition of the dataset. The type of files (data instances), it's number, and information regarding attributes 

### Statistics 
A set of statistics can be provided for each attribute and at a data instance level. Please provide only the statistics that are relevant for the specific dataset use case.

### Consistency rules
The Consistency rules can be expressed following OCL. OCL is a language for expressing constraints on models. It is based on the Object Constraint Language (OCL) defined by OMG. OCL is a language for expressing constraints on models. It is based on the Object Constraint Language (OCL) defined by OMG. \n
            
            `;
            // Provenance
            case "Provenance":
                return `## Provenance 
In this section authors are expected to fill information about the process applied to create the dataset 

### Curation Rationale 
This explanation intend to be a shor and comprhensive enumartion of the processes applied over the data, and to provide specific use-case details for this dataset

### Gathering 
How the dataset has been gathered? Who gathered the dataset? Which are the sources of the data?

### Annotation 
How the dataset has been annotated? Who annotated the dataset? Which are the infrastructure used to annotate the data?

### Data preparation 
Indicate the process done to prepare the data, and it's type
            
            `;
            // Social Concers
            case "Concerns":
                return `
## Social Concerns
In this section authors are expected to fill information about the social concerns of the data. Is expected to inform 4 types of social concerns \n

### Bias concers 
Whether the dataset may be biased against a specific social group 

### Representativeness concerns 
Whether the dataset could misrepresent any specific social group

### Sensitivity concerns 
Does the dataset contains data that can offend a social group?

### Privacy Concerns 
Is there any privacy concerns on the data?
        
        `;
            default:
                return "empty";
        }
    }
}
exports.HintsService = HintsService;
//# sourceMappingURL=hints-service.js.map