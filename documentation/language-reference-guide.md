<div align="center">

<div align="center" style="width:50px">
    
 <img
  src="../fileicons/requisito.png"
  alt="HTML generator"
  title="Optional title"
  style="display: inline-block; margin: 0 auto; width: 200px">

</div>
    
# DescribeML: 
#### Language Reference Guide 
(Version 0.0.5)


DescribeML is a VSCode language plugin to describe machine-learning datasets. <br>


</div>

***

## General Structure:

+  [Metadata](#metadata)
    + [Dates](#dates)
    + [Citation](#citation)
    + [Description](#description)
    + [Applications](#applications)
    + [Distribution](#distribution)
    + [Authoring](#authoring)

+ [Composition](#composition)
    + [Instances](#instances)
    + [Attributes](#attributes)
    + [Statistics](#statistics)
    + [Consistency Rules](#consistency)
+ [Provenance](#provenance)
    + [Gathering processes](#gathering)
    + [Labeling processes](#labeling)
    + [Data preprocesses](#preprocess)
+ [Social Concerns](#concerns)




***
***

#### <a name="metadata"></a> Metadata:

+ **Title:** `STRING`: The public title of the dataset
+ **Unique-identifier:** `ID` Machine-readable unique identifier of the dataset
+ **Version:** `ID`  The version of the dataset 

+ **Date:**  <a name="dates"></a> The date of the dataset 
    + **Created:** `DATE`  The date where the dataset was initially created: 
    + **Modified:** `DATE` The date where the dataset was last modified: 
    + **Published:** `DATE`  The publication date of the dataset:

 + **Citation:** <a name="citation"></a>The citation of the dataset, between chose between a raw citation and a structured format
    ```json
        Citation: 
                title: "SIIM-ISIC 2020 Challenge Dataset. International Skin Imaging Collaboration"
                year: 2020
                publisher: "International Skin Imaging Collaboration"
                doi: "doi.org/10.34970/2020-ds01"
                url: "https://www.kaggle.com/c/siim-isic-melanoma-classification"
    ```
    + **Raw Citation:** `STRING` Raw citation as text, or as Bibtex or equivalent format, of the dataset 
    + **OR:**
        +   **Title:** `STRING` The title of the dataset
        +   **Authors:** `STRING` The authors of the dataset
        +   **Year:** `DATE` The year of the dataset
        +   **Journal/Conference:** `STRING` The publisher of the dataset
        +   **Publisher:** `STRING` The publisher of the dataset:
        +   **URL:** `URL` The URL of the dataset
        +   **DOI:** `ID` The DOI of the dataset
        +   **ISBN:** `ID` The ISBN of the dataset
+ **Description:** <a name="description"></a> The description of the dataset
    ```json
        Description:    
            Purposes:
                Purposes: "The 2020 SIIM-ISIC Melanoma" 
                Tasks:    [classification]
                Gaps:     "As the leading healthcare organization for informatics in medical imaging..." 
                Areas:    HealthCare
                Tags:     Images Melanoma diagnosis Skin Image
    ```
    + **Description:** `STRING` Textual description of the dataset
    **OR:**
        + **Purposes** `STRING` For what purposes was the dataset created?
        + **Tasks:** `TASKS ENUMERATE` List of ML tasks the dataset is intended for: `Autocomplete feature will guide you througt the options`
        + **Gaps:** `STRING` Which gaps does the dataset aims to fill
    + **Areas:** `ID` Set a list of areas of the dataset
    + **Tags:** `ID, ...` Set a list of Tags of the dataset

+  **Applications** <a name="applications"></a> Summerize the applications of the dataset
    + **Past Uses:** `STRING` Summerize the past uses of the dataset
    + **Recommended uses:** `STRING` Summerize the recommended uses of the dataset
    + **Non-recommended uses:** `STRING` Summerize the non-recommended uses of the dataset.
    + **Benchmarking:** Benchmarking of the dataset
        + **Task:** `TASKS ENUMERATE` Task to benchmark `Autocomplete feature will guide you through the options`
        + **Metric:** Metric to benchmark   
            + **F1:** `NUMBER` F1 score
            + **Accuracy:** `NUMBER` Accuracy score
            + **Precision:** `NUMBER` Precision score
            + **Recall:** `NUMBER` Recall score
        + **Reference:** `STRING` Source of the benchmark
+ **Distribution** <a name="distribution"></a> Summerize the distribution of the dataset
    + **Is public?:** `BOOL` Indicate if the dataset is public available
    + **Licences:** `LICENCES ENUMERATE` List of common licences, use other if not fits your case: `The Montreal data licence , Creative Commons, CC0: Public Domain ...`
    + **Rights(stand-alone)** `ENUMERATE` Montreal data licence enumerate of stand-alone rights: Access | Tagging |'Distribute | Re-Represent
    + **Rights(with models):** `ENUMERATE` Montreal data licence enumerate of model related rights: `Benchmark | Research | Publish' | Internal Use | 'Output Commercialization' | Model Commercialization`
    + **Credits/Attribution Notice:** `STRING` Who need to be credited when using the dataset
    + **Designated Third Parties:** `STRING` Third parties in charge of licencing and distribution issues
    + **Additional Conditions:** `STRING` Other issues specified by the authors
+ **Authoring** <a name="authoring"></a>Authoring of the dataset
    + **Authors** Authors of the dataset
        + **Name:** `STRING` Name of the author
        + **Email:** `EMAIL` Email of the author
    + **Founders** Founders of the dataset
        + **Name:** `STRING` Name of the founder
        + **Type:** `ENUMERATE` Type of the founder `private | public | mixed;`
        + **Grantor** `STRING` Grantor of the dataset
        + **Grant ID:** `ID` Machine-readble name of the grant id
    + **Maintainers** Maintainers of the dataset
        + **Name:** `STRING` Name of the maintainer
        + **Email:** `EMAIL` Email of the maintainer
    + **Erratum?:** `STRING` Is there any erratum?
    + **Data retention:** `STRING` Please indicate any data retention policy
    + **Version lifecycle:** `STRING` Describe the planned version lifecycle
    + **Contribution guidelines** `STRING `Is there any contribution guideline?

***
***

#### <a name="composition"></a> Composition:
 + **Rationale** `STRING `Provide a composition rationale
 + **Total Size** `NUMBER `Total size of tuples of the dataset
 + **Instances** <a name="instances"></a> A composition description of each instance of the dataset
    + **Instance:** `ID` Machine-readable name of the instance
    + **Size:** `NUMBER` Size of the instance
    + **Description:** `STRING` Description of the instance
    + **Type:** `ENUMERATE` Type of the instance `Record-Data | Time-Series | Ordered | Graph | Other`
    + **Attribute Number:** `NUMBER` Number of attributes
    + **Attributes:** <a name="attributes"></a> Description of each attribute of the instance
        + **attribute:** `ID` Machine-readable name of the attribute
        + **Description:** `STRING` Description of the attribute
        + **labeling process:** `Labeling process` Reference to a declared labeling process (first you should complete the provenance part)
        + **unique values:** `NUMBER` Type of the attribute
        + **ofType:** `ENUMERATE` Type of the attribute `Categorical | Nominal`
            **If** `ofType` is `Categorical`
            + **Statistics:** Statistic of the attribute
                + **Unique:** `NUMBER` Unique tuples (without duplications)
                + **Unique Percentage:** `NUMBER` Percentage of unique tuples
                + **Missing Values:** `NUMBER` Number of missing values
                + **Completeness:** `NUMBER` Completeness of the attribute
                + **Mode:** `STRING` Mode of the attribute
                + **First Rows:** `[0: ROW1, ...]` Percentage of the mode
                + **Min-leght:** `NUMBER` Min of the attribute
                + **Max-lenght:** `NUMBER` Max of the attribute
                + **Median-lenght:** `NUMER` Median lenghts of the attribute
                + **Lenght-histogram:** `STRING` Histogram of the attribute
                + **Chi-Squared:** Chi-Squared of the attribute
                    + **statistic:** Statistic of the chi-sqaure analysis
                    + **p-value:** p-value of the chi-sqaure analysis
                + **Binary attribute:** `BOOL` Is a binnary attribute?
                    + **Symmetry:** `ENUMERATE` `Symmetryc | Asymmetryc`
                    + **Attribute Sparsity:** `NUMBER` How sparse is the binnary attribute?
                + **Categoric Distribution:** `["CATEGORY": "NUMBER"%, ...]` Categoric distribution of the attribute
            **Else** `ofType` is `Nominal`
            + **Statistics:** Statistics of the attribute
                + **Mean:** `NUMBER` Unique tuples (without duplications)
                + **Median:** `NUMBER` Percentage of unique tuples
                + **Mode:** `NUMBER` Mode of the attribute
                + **Minimmum:** `NUMBER` Min of the attribute
                + **Maximmum:** `NUMBER` Max of the attribute
                + **Quartiles:** `[Q1:NUMBER, ...]` Median lenghts of the attribute
                + **IQR:** `NUMBER` Histogram of the attribute
     + **Statistics:** <a name="statistics"></a> (instance) Statistic of the instance
        + **Correlations:**  Correlation of the instance, choose one calculation type
            + **Pearson:** `[INDEX:"NUMBER", ...]` Pearson correlation of the instance
            + **Spearman:** `[INDEX:"NUMBER", ...]` Spearman correlation of the instance
            + **Kendall:** `[INDEX:"NUMBER", ...]` Kendall correlation of the instance
            + **Cramers:** `[INDEX:"NUMBER", ...]` Cramers correlation of the instance
            + **Phi-k** `[INDEX:"NUMBER", ...]` Phi-k correlation of the instance
        + **Pair Correlation** `Between [ATTRIBUTE], and [ATTRIBUTE]` Points the relevant pair-correlation between two intances of declared attributes.
        + **Quality Metrics:** General quality metrics of the instance
            + **Sparsity**: `NUMBER` Sparsity of the instance
            + **Completeness**: `NUMBER` Completeness of the instance
            + **Class balance**: `STRING` Class balance of the instance
            + **Noisy labels**: `STRING` Noisy labels of the instance
    + **Consistency Rules:** <a name="consistency"></a> Set the consistency rules of your dataset
        + **Rule:** `OCLExpression` OCL expression of the rule
+ **Dependencies:** Dependencies of the rule
    + **Description:** `STRING` Description of the depedencie
    + **Links:** `URL` Link to the depedency artifact
+ **Instances relation:** `Relation: ID attribute: [ATTRIBUTE] is related to [INSTANCE]` Relation between instances

***
***

#### <a name="provenance"></a> Provenance: 
+ **Curation Rationale** `STRING` Provide a provenance rationale
+ **Gathering Processes: <a name="gathering"></a>**
    + **Process:** `ID` Machine-readable name of the process
    + **Description:** `STRING` Description of the process
    + **When data was collected:** `STRING` Date where data the proces was performed
    + **How data was collected** `STRING` How data was collected
    + **Is language data:**  Set the speech situation
        + **Language:** `STRING` Language of the data
        + **Time and place:** `STRING`
        + **Modality:** `ENUMERATE` Modality of the speech `spoken/signed | written`
        + **Type:** `ENUMERATE` Type of the speech `scripted/edited | spontaneous`
        + **Syncrony:** `ENUMERATE` Syncrony of the speech `synchronous |asynchronous`
        + **Inteded Audience:** `STRING` Intended audience of the speech
    + **Social Issues:** `[SOCIAL ISSUES]` Relation of the gathering process with an already declared social issue instance
    + **Source:** Source of the data
        + **Source:** `ID` machine-readable name of the source
        + **Description:** `STRING` Description of the source
         + **Noise:** `STRING` Description of the source's noise
        + **Links:** `URL` Link to the source artifact
    + **Process Demographics:**
        + **Age:** `NUMBER` Median age of the participants
        + **Gender:** `STRING` Gender relation of the participants
        + **Country/Region** `STRING` Country/Region of the participants
        + **Race/Ethnicity** `STIRNG` Race or ethinicity of the participants
        + **Native Langugage** `STRING` Native language of the participants
        + **Socioeconomic status** `STRING` Socioeconomic status
        + **Number of speakers represented:** `NUMBER` Number of participants
        + **Precense of disorders in speech:** `STRING` Number of speakers
        + **Training in linguistics/other relevant disciplines** `STRING` Explain the trainig of the participants
    + **Gathering Team** Team in charge of gathering the data
        + **Who collects the data:** `STRING` Who collects the data
        + **Type** `ENUMERATE` `Internal | External | Contractors | Crowdsourcing`
        + **Demographics:** Demogrpahics of the gathering team
             + **Age:** `NUMBER` Median age of the participants
            + **Gender:** `STRING` Gender relation of the participants
            + **Country/Region** `STRING` Country/Region of the participants
            + **Race/Ethnicity** `STIRNG` Race or ethinicity of the participants
            + **Native Langugage** `STRING` Native language of the participants
            + **Socioeconomic status** `STRING` Socioeconomic status
            + **Training in linguistics/other relevant disciplines** `STRING` Explain the trainig of the participants
    + **Gathering Requirements:** `Requirement: STRING, ...`
+ **LabelingProcesses:** <a name="labeling"></a>
    + **Labeling process:** `ID` Machine-readable name of the labeling process
    + **Description:** `STRING` Description of the labeling process
    + **Type:** `ENUMERATE` `'Bounding boxes' | 'Lines and splines' | 'Semantinc Segmentation' | '3D cuboids' | 'Polygonal segmentation' | 'Landmark and key-point' | 'Image and video annotations' | 'Entity annotation' | 'Content and textual categorization`
    + **Labels:**  Labels of the labeling process
        + **Label:** `ID` Machine-readable name of the label
        + **Description:** `STRING` Description of the label
        + **Mapping:** [ATTRIBUTE,...] Relate a label with instances of attributes already declared in the documentation
    + **Labeling Team**:
        + **Who collects the data:** `STRING` Who collects the data
        + **Type** `ENUMERATE` `Internal, External, Contractors, Crowdsourcing`
        + **Demographics:** Demogrpahics of the gathering team
            + **Age:** `NUMBER` Median age of the participants
            + **Gender:** `STRING` Gender relation of the participants
            + **Country/Region** `STRING` Country/Region of the participants
            + **Race/Ethnicity** `STIRNG` Race or ethinicity of the participants
            + **Native Langugage** `STRING` Native language of the participants
            + **Socioeconomic status** `STRING` Socioeconomic status
            + **Number of speakers represented:** `NUMBER` Number of participants
            + **Precense of disorders in speech:** `STRING` Number of speakers
            + **Training in linguistics/other relevant disciplines** `STRING` Explain the trainig of the participants
    + **Infrastructure:** Infrastructure used to annotate the data
        + **Tool:** `STRING` Tool used to annotate the data
        + **Platform:** `STRING` Platform where the tool works
        + **Version:** `STRING` Version of the tool and platform
        + **Language:** `STRING` Language of the tool
        + **Comments:** `STRING` Provide comments about the tool
    + **Validation:** Validation methods to ensure annotation quality
        + **Validation Methods:** `STRING` Validation method used
        + **Validation Dates:** `STRING` Dates where the validation where done annotations
        + **Golden Questions:**  Golden Question pass to the annotators
            + **Question:** `STRING` Textual question
            + **Inter-annotation agreement:** `NUMBER` Inter-annotation agreement for each question. Low values mean low confidence in the annotation
        + **Validation Requirements:** `Requirement: STRING, ...` Provide comments about the validation tool
    + **Labeling Requirements:** `Requirement: STRING, ...`
+ **Preprocesses:** <a name="preprocess"></a> Data preprocesses done over the data
    + **Preprocess:** `ID` machine-readable name of the preprocess
    + **Type:** `ENUMERATE` Type of preprocess applied `'Missing Values' | 'Data Augmentation' | 'Outlier Filtering' | 'Remove Duplicates' | 'Data reduction' | 'Sampling' | 'Data Normalization' | 'Others' `
    + **Description:** `STRING` Description of the preprocess
    + **Social Issues:** `[SOCIAL ISSUES]` Relation of the preprocess with an already declared social issue instance

***

##### Social Concerns

+ **Social Concerns** <a name="preprocess"></a>
    + **Rationale:** `STRING` Rationale of the social concerns of the dataset
    + **Social Issues:** Social issues identified from the data
        + **Social Issue:** `ID` Machine-readable name of the social issue
        + **IssueType:** `ENUMERATE` Type of social concern `'Privacy' | 'Bias' | 'Sensitive Data' | 'Social Impact'`
        + **Description:** `STRING` Description of the social issue
        + **Related Attributes** `attribute: [ATTRIBUTE]` Attributes related to the social issue
        + **Instace belong to people:** 
            + **Have sensitive attributes?** `[Attribute], ...` List of sensitive attributes
            + **Are there protected groups?** `ENUMERATE` (Yes, No, Unknown)
            + **Might be offensive?** `STRING` Is there offensive content in the dataset

***
***
<div align="center">
For any related question, please contact the authors at: jginermi@uoc.edu
</div>


  
