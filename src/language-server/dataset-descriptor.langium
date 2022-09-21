grammar DatasetDescriptor

entry DescriptionDataset:
    (elements+=Declaration)*;

Declaration:
 'Dataset:' name=ID 
  generalinfo=Metadata
  composition=Composition 
  provenance=Provenance
  socialConcerns=SocialConcerns
;

//
// Metadata
//
Metadata:
     name= 'Metadata:'
     'Title:' title=STRING 
     'Unique-identifier:' ident=ID
     'Version:' version=ID 
     (dates=Dates)?
     (citation=Citation)?
     (desc=Description)?
     (uses=Applications)?
     (distribution=Distribution)?
      authoring=Authoring;

// Dates
Dates:
    name="Dates:"
     (datesR=ReleaseDate )?
     (datesU=UpdateDate )?
     (datesP=PublishedDate )?;
ReleaseDate:
    name="Release Date:"
    datesR=DateYear;

UpdateDate:
    name="Updated Date:"
    datesU=DateYear;

PublishedDate:
    name="Published Date:"
    datesP=DateYear;

// Descriptions
Description: 
    name="Description:"
    (desc=STRING | 
        (('Purposes:' descriptionpurpose=STRING)? 
         (tasks='Tasks:' '[' descriptionTasks+=Task ((','descriptionTasks+=Task)*']')?)? 
         ('Gaps:' descriptionGaps=STRING)?)) 
         (area=Areas)?
         (tags=Tags)?;
Tasks:
     name='Tasks:' '[' descriptionTasks+=Task ((','descriptionTasks+=Task)*)?']';
Task:
    name=MLTasks;


Areas: name='Areas:' areas+=Area;
Tags: name='Tags:' (tags+=Tag)*;

Area:
    name=ID;
Tag:
    name=ID;

// Citations
Citation:
    name="Citation:"
    (("Raw Citation:") citeText=STRING |
     ("Title:" title=Title)?
     ("Authors:" authorsPaper=Citeauthors)?
     ("Year:" year=NUMBER) )?
     ("Keywords:" "["(keywords+=Keyword)*"]")?
     ("Journal:" publisher=Publisher)?
     (("DOI:" doi=DoiCite)? 
     ("Url:" url=CiteUrl)? 
    );

Title:
    name=STRING;
Citeauthors:
    name=STRING;
Keyword:
    name=STRING;
Publisher:
    name=STRING;
DoiCite:
    name=DOI;
CiteUrl:
    name=STRING;



// Distrubtion
Distribution:
    name="Distribution:"
    ("Is public?:" public=BooleanAnswer)?
    ('Licences:' licence=CommonLicences)?
    ('Rights(stand-alone):' rights=RightsData)?
    ('Rights(with models):' rightsModels=RightsModel)?
    ('Credit/Attribution Notice' attribution=STRING)?
    ('Designated Third Partes' thirdParties=STRING)?
    ('Additional Conditions' addCond=STRING)?;

// Applications
Applications:
    name="Applications:"
    ("Past Uses:" (past+=STRING)*)?
    ("Recommended:" (recommend+=STRING)*)?
    ("Non-recommended:" (future+=STRING)*)?
    ("Uses repository:" repo=STRING)?
    (bachmarking=Benchmarking)?;


Benchmarking:
    name="Benchmarking:"
    (("Task:" taskName=[Tasks:MLTasks])?
    ('['("Model:" (modelName=STRING))?
    ("Metrics:" '['     
                ("F1:" (f1=NUMBER))?
                ("Acurracy:" (acurracy=NUMBER))?
                ("Precision:" (precision=NUMBER))?
                ("Recall:" (recall=NUMBER))? ']'?)?
    ("Reference:" (reference=STRING))?']')*)*;


// Authoring
Authoring:
    name= 'Authoring:' 
    (authors+=Authors
      founding+= (Founders)?
      ('Maintainer:' (maintainers+=Maintainer)*)?
      ('Erratum?:' (erratum=STRING | erratum=BooleanAnswer))? 
      ('Data Retention:' dataRetention=STRING)? 
      ('Version lifecycle:' support=STRING)? 
      ('Contribution guidelines:' contribGuides=STRING)?);
Authors: 
    name='Authors:'  (authors+=Author*);
Author:
    'Name' name=ID 'email' email=EmailType;
Founders: 
    name='Funders:'  (funders+=Funder)+;
Funder:
    'Name' name=ID 'type' type=FundersType ('grantor' grantor= STRING 'grantId:' ID)?;
Maintainer:
    'Name' name=ID 'email' email=EmailType;

//
// Dataset Composition 
//
 Composition:
     name='Composition:'
     'Rationale:' compodesc+=STRING
     ('Total size:' numberInst=NUMBER)? 
     (instances += DataInstances)*
     (relation=RelationInstances)?
     ('Dependencies:' dependencies=Dependencies)? 
     ('Is sample:' ((sample='NO')|(sample=Sample)))?
     ('Data Splits:' splits=STRING)?;

// Data Instances
DataInstances:
    name='Data Instances:' (instances+=DataInstance)*;
DataInstance:
    'Instance:' name=ID 
    'Description:' descript=STRING 
    'Type:'  type=InstanceType  
    'Attribute number:' attrnum=NUMBER
    ('Size:' numIns=NUMBER)?
    ('Attributes:' (attributes+=Attribute)*)?
    ('Statistics:' statistics+=Statistics)?
    ('Consistency rules:' (rules+=ConsistencyRules)*)?;

// Statistics
Statistics:
    ('Correlations:' correlations=Correlations)?
    ('Pair Correlation:' (pair+=PairCorrelation)*)?
    ('Quality Metrics:' metric+=QualityMetric)?;

PairCorrelation:
    (
        'between' attr1=[Attribute] 'and' 
        (attr2=[Attribute] | 'external source'
        'From:' from=STRING "Rationale:" rationale=STRING)
    )?;

QualityMetric:
    ('Sparsity:' sparsity=NUMBER)?
    ('Completeness:' complet=NUMBER)?
    ('Class Balance:' balance=STRING)?
    ('Noisy labels:' noisy=STRING)?;

// Consistency Rules
ConsistencyRules:
    'inv:' instance1=[DataInstance] ": ("attrule1=[Attribute]  Operators (comparator = NUMBER | attrule2=[Attribute])? ")";
   
   

// Attributes
Attribute:
    'attribute:' name=ID 
    'description:' attdesc=STRING 
    ('labeling process:' labelProces=[LabelingProcess])?
    ('unique values:' unique=NUMBER)?
    ('count:' count=NUMBER)?
    ('ofType:' ((attType=Categor)|(attType=Numeri)))?;
   

Categor:
    name='Categorical'
    (('Statistics:')
    ('Unique:' unique=NUMBER)?
    ('Unique percentage:' uniqueper=NUMBER '%')?
    ('Missing Values:' missingv=NUMBER)?
    ('Completeness:' complet=NUMBER )?
    ('First Rows:' firstrows=FirstRows)?
     ('Min-lenght:' minlenght=NUMBER)?
    ('Max-lenght:' maxlenght=NUMBER)?
    ('Median-lenght:' medianlenght=NUMBER )?
    ('Lenght-histogram:' '[' lenghthistorgram=HistogramType (',' lenghthistorgram+=HistogramType)* ']')?
    ('Chi-Squared:' chisquared=ChiSquare )?
    ('Binary attribute:' binary=Binary)?
    ('Mode:' mode=STRING)?
    ('Categoric Distribution:' '[' catdist=StringNumberType '%' (',' catdist+=StringNumberType '%')* ']')?)?
    ('Quality Metrics:' metrics+=QualityMetric)?;

Binary:
    'Symmetry:' sym=AttributeSymmetry
    'Attribute Sparsity:' attspar=NUMBER;

FirstRows:
    '0:' rows+=STRING ','
    '1:' rows+=STRING ','
    '2:' rows+=STRING ','
    '3:' rows+=STRING ','
    '4:' rows+=STRING ','
    '5:' rows+=STRING;

ChiSquare:
    ('statistic:' statistic=NUMBER ',')?
    ('p-value:' pvalue=NUMBER)?;

Correlations:
    ('Pearson:'  '[' pearson=StringNumberType (',' pearson+=StringNumberType)* ']')?
    ('Spearman:' '[' spearman=StringNumberType (',' spearman+=StringNumberType)* ']')?
    ('Kendall:' '[' kendall=StringNumberType (',' kendall+=StringNumberType)* ']')?
    ('Cramers:' '[' cramers=StringNumberType (',' cramers+=StringNumberType)* ']')?
    ('Phi-k:' '[' phik=StringNumberType (',' phik+=StringNumberType)* ']')?;


Numeri:
    name='Numerical' 
    (('Statistics:')
    ('Mean:' mean=NUMBER)?
    ('Median:' median=NUMBER)?
    ('Standard Desviation:' std=NUMBER)?
    ('Minimmum:' min=NUMBER)?
    ('Maximmum:' max=NUMBER)?
    ('Quartiles:' quartiles=Quartile)?
    ('IQR:' iqr=NUMBER)?)?
    ('Quality Metrics:' metrics+=QualityMetric*)?;

Quartile:
    'Q1:' q1=NUMBER 
    'Q2:' q2=NUMBER 
    'Q3:' q3=NUMBER 
    'Q4:' q4=NUMBER;

// Relation between Instances
RelationInstances:
    'Instaces relation:' (relation+=Relation)*;
Relation:
    ('Relation:' name=ID 'attribute:' attRel=[Attribute] "is related to:" insRel=[DataInstance] ('and attribute:' attRelTarget=[Attribute]))*;

// Instance Dependencies
Dependencies:
        "Description:" desc=STRING
        ('Links:' 
            'Complete archival version:' archival=STRING
            'Restriction:' restriction=STRING
            'Rate Limit Usage:' limit=STRING)?;


// Sampling
Sample:
    name='YES' 
    ('Sampling Method:' type=SampleType)?
    ('Sampling criteria:' (criteria=STRING))?
    ('Sampling Characteristics:' (charact+=SamplingCharacteristics)*)?

    ;

SamplingCharacteristics:
    'Total Data Sampled' total=NUMBER
    'Sampling Rate' rate=NUMBER
    'Sampling Mean' mean=STRING
    'Sampling Standard Deviation' std=NUMBER
    'Sampling Distribution' distribution=NUMBER
    'Sampling Variation' variation=NUMBER;



//
// Provenance
//
Provenance:
    name='Data Provenance:'
    'Curation Rationale:' curation=STRING
    ((gathering+=GatheringProcesses)*)?
     ((labeling+=LabelingProcesses)*)?
     ((other+=PreProcesses)*)?;

// Gathering
GatheringProcesses:
    name='Gathering Processes:' (processes+=GatheringProcess)*;

GatheringProcess:
    'Process:' name=ID
    'Description:' desc=STRING
     source=Source  
    ('Gathering dates range:' gatherDates=STRING)?
    ('Related Instances:' (mapInstance=[DataInstance] (',')?)*)?
    ('Social Issues:' labelSocialIssues=[SocialIssue])?
    ('How data is collected:' how=GatherType)?
    ('Is language data?:' SpeechSitatuion)?
    ('When data was collected:' when=STRING)?
    ('Process Demographics:' processDemo = Demographics)?
    ('Gathering Team:' gatheringTeam = Team)?
    ('Gather Requirements:' (requeriments+=Requeriments)*)?;

Source:
    'Source:' name=ID
    'Description:' sourcedesc=STRING
    'Noise:' (noise+=STRING)*;

SpeechSitatuion:
    ('Time and place:' name=STRING)?
    ('Modality:' name=SpeechModality)?
    ('Type:' name=SpeechType)?
    ('Syncrony:' name=SpeechSyncrony)?
    ('Inteded Audience:' name=STRING)?;


Team:
    'Who collects the data:' who=STRING
    'Type' gatherType=TeamType
    teamDemographics = Demographics;

// Requeriments
Requeriments:
    'Requirement:'
    req=STRING;




// Labeling
LabelingProcesses: 
    name='LabelingProcesses:' (labprocesses+=LabelingProcess)*;
LabelingProcess:
    'Labeling process:' name=ID
    'Description:' desc=STRING
    ('Type:' type=AnnotationType)?
    ('Labels:' (Labels)*)?
    ('Labeling Team:'labelingTeam = Team)?
    ('Infrastructure:' infra=Infrastructure)?
    ('Validation:' validation=Validation)?
    ('Social Issues:' labelSocialIssues=[SocialIssue])?
    ('Label Requirements:' (requeriments+=Requeriments)*)?;
Labels:
    'Label:' name=ID
    'Description:' desc=STRING
    'Mapping:' (map=[Attribute] (',')?)*;

Infrastructure:
    ('Tool' tool=STRING)?
    ('Platform' platform=STRING)?
    ('Language' language=STRING)?
    ('Version' version=STRING)?
    ('Comments' other=STRING)?;

Validation:
    ('Validation Method:' method=STRING)?
    ('Validation Dates:' validationDates=STRING)?
    ('Golden Questions:' '[' goldenquestions=STRING (',' goldenquestions=STRING)* ']')?
    ('Inter-rater adjudication policy:' interRater=STRING)?
    ('Validation Requirements:' (requeriments+=Requeriments)*)?;

LabelRequeriments:
    ('Requirements:' (requeriments+=Requeriments)*)?;

Demographics:
    ('Age:' age=STRING)?
    ('Gender:' gender=STRING)?
    ('Country/Region:' country=STRING)?
    ('Race/Ethnicity:' race=STRING)?
    ('Native Language:' native=STRING)?
    ('Socioeconomic status:' status=STRING)?
    ('Number of speakers represented:' number=STRING)?
    ('Presence of disordered speech:' disordered=STRING)?
    ('Training in linguistics/other relevan disciplines:' training=STRING)?;


// Data Preprocess
PreProcesses:
    name='Preprocesses:' (preprocesses+=PreProcess)*;
PreProcess:
    'Preprocess:' name=ID
    'Description:' desc=STRING;


//
//  SocialConcerns
//
SocialConcerns:
    name='Social Concerns:'
    ('Rationale:' desc=STRING)?
    (socialIssues+=SocialIssue)*;

SocialIssue:
    'Social Issue:' name=ID
    'IssueType:' IssueType=SocialIssueType
    ('Related Attributes:' ('attribute:' senseAtt=[Attribute])*)?
    'Description:' desc=STRING
    ('Instance belongs to people:' 
        ('Have sensitive attributes?' ('attribute:' senseAtt=[Attribute])*)?
        ('Are there protected groups?' procGroups=BooleanAnswer)?
        ('Might be offensive' offDiscussion=STRING)?)?
    ;

    


// Semantical Type Rules

CommonLicences returns string:    'The Montreal data licence' | 'Creative Commons' | 'CC0: Public Domain' | 'CC BY-NC-SA 4.0' | 'CC BY-SA 4.0' |'CC BY-SA 3.0' |'CC BY 4.0 (Attribution 4.0 International)' |'CC BY-NC 4.0 (Attribution-NonCommercial 4.0 International)' |'CC BY 3.0 (Attribution 3.0 Unported)' | 'CC BY 3.0 IGO (Attribution 3.0 IGO)'| 'CC BY-NC-SA 3.0 IGO (Attribution-NonCommercial-ShareAlike 3.0 IGO)' | 'CC BY-ND 4.0 (Attribution-NoDerivatives 4.0 International)'
                                | 'CC BY-NC-ND 4.0 (Attribution-NonCommercial-NoDerivatives 4.0 International)' | 'GPL' | 'GPL 2' | 'LGPL 3.0 (GNU Lesser General Public License 3.0)' | 'AGPL 3.0 (GNU Affero General Public License 3.0)'
                                | 'FDL 1.3 (GNU Free Documentation License 1.3)' | 'Open Data Commons' |'Database: Open Database, Contents: Database Contents' |'Database: Open Database, Contents: © Original Authors' | 'PDDL (ODC Public Domain Dedication and Licence)' | 'ODC-BY 1.0 (ODC Attribution License)'
                                | 'Community Data License' | 'Community Data License Agreement - Permissive - Version 1.0' | 'Community Data License Agreement - Sharing - Version 1.0' | 'Special' | 'World Bank Dataset Terms of Use' | 'Reddit API Terms' | 'U.S. Government Works' | 'EU ODP Legal Notice';
RightsData returns string: 'Access' | 'Tagging' | 'Distribute' | 'Re-Represent';
RightsModel returns string: 'Benchmark' | 'Research' | 'Publish' | 'Internal Use' | 'Output Commercialization' | 'Model Commercialization';

MLTasks returns string: 'text-classification'|'question-answering'|'text-generation'|'token-classification'|'translation'|
                        'fill-mask'|'text-retrieval'|'conditional-text-generation'|'sequence-modeling'|'summarization'|'other'|
                        'structure-prediction'|'information-retrieval'|'text2text-generation'|'zero-shot-retrieval'|
                        'zero-shot-information-retrieval'|'automatic-speech-recognition'|'image-classification'|'speech-processing'|
                        'text-scoring'|'audio-classification'|'conversational'|'question-generation'|'image-to-text'|'data-to-text'|
                        'classification'|'object-detection'|'multiple-choice'|'text-mining'|'image-segmentation'|'dialog-response-generation'|
                        'named-entity-recognition'|'sentiment-analysis'|'machine-translation'|'tabular-to-text'|'table-to-text'|'simplification'|
                        'sentence-similarity'|'zero-shot-classification'|'visual-question-answering'|'text_classification'|'time-series-forecasting'|
                        'computer-vision'|'feature-extraction'|'symbolic-regression'|'topic modeling'|'one liner summary'|'email subject'|'meeting title'|
                        'text-to-structured'|'reasoning'|'paraphrasing'|'paraphrase'|'code-generation'|'tts'|'image-retrieval'|'image-captioning'|
                        'language-modelling'|'video-captionning'|'neural-machine-translation'|'transkation'|'text-generation-other-common-sense-inference'|
                        'text-generation-other-discourse-analysis'|'text-to-tabular'|'text-generation-other-code-modeling'|'other-text-search'|'Code Generation'|
                        'Translation'|'Text2Text generation'|'text-to-slide'|'question-pairing'|'Information Retrieval'|'Semantic Search'|'Evaluation of language models'|
                        'masked-language-modeling'|'multi-class classification'|'topic-classification'|'patents'|'paraphrase detection'|'news-classification'|
                        'Summarization'|'cross-language-transcription'|'language-modeling'|'other-test'|'grammatical error correction'|'named-entity-disambiguation'|
                        'textual-entailment'|'natural-language-inference'|'query-paraphrasing'|'machine translation'|'long-texts'|'text-regression'|
                        'entity-extraction'|'unpaired-image-to-image-translation'|'image'|'generative-modelling'|'Token Classification'|'caption-retrieval'|
                        'gpt-3'|'crowdsourced'|'sequence2sequence'|'Inclusive Language'|'Text Neutralization'|'text-to-speech'|'question_answering'|
                        'super-resolution'|'image-enhancement'|'speech-synthesis'|'data-integration'|'Language-model'|'Automatic-Speech-Recognition'|
                        'influence-attribution'|'question-answering-retrieval'|'text'|'linear-regression'|'table-question-answering'|'tabular-classification'|
                        'syntactic-evaluation'|'deduplication'|'sequence-modelling'|'abstractive-qa'|'closed-domain-abstrative-qa'; 
InstanceType returns string: 'Record-Data' | 'Time-Series' | 'Ordered' | 'Graph' | 'Other';
FundersType returns string: 'private' | 'public' | 'mixed';
AttributeSymmetry returns string: 'Symmetric' | 'Asymmetric';
AnnotationType returns string: 'Bounding boxes' | 'Lines and splines' | 'Semantinc Segmentation' | '3D cuboids' | 'Polygonal segmentation' |
                               'Landmark and key-point' | 'Image and video annotations' | 'Entity annotation' | 'Content and textual categorization';
SocialIssueType returns string: 'Privacy' | 'Bias' | 'Sensitive Data' | 'Social Impact'; // Expecting Fairness Ontology
GatherType returns string: 'API' | 'Sensors' | 'Manual Human Curator' | 'Software' | 'Others';
TeamType returns string: 'Internal' | 'External' | 'Contractors' | 'Crowdsourcing';
SpeechModality returns string: 'spoken/signed' | 'written';
SpeechType returns string: 'Scripted/edited' | 'spontaneous';
SpeechSyncrony returns string: 'synchronous interaction' | 'asynchronous intercation';
BooleanAnswer returns string: 'Yes' | 'No';
SampleType returns string: 'Cluster Sampling' | 'Haphazard Sampling' | 'Multi-stage Sampling' | 'Stratified Sampling' | 'Systematic Sampling' | 'Weighted Sampling' | 'Other';
// Logic Data Types
StringNumberType returns string: STRING + ':' + NUMBER;
HistogramType returns string: NUMBER + ':' + NUMBER;
DataTypes returns string: 'String' | 'Integer' | 'Boolean' | 'Other';
QualifiedName returns string: ID ('.' ID)*;
Operators returns string: '<'|'>'|'='|'!='|'+'|'-'|'>=';


// Terminals
hidden terminal WS: /\s+/;
terminal ID: '^'?(/[_a-zA-Z]/|'_')(/[_a-zA-Z]/|'_'|/[0-9]/)*;
terminal NUMBER returns number: /[0-9]+(\.[0-9])?/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;


// Date Logic
Dash returns string: "-";
//Day returns string: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29" | "30" | "31";
//Month returns string: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11"| "12";
//Year returns string: "1989" | "1990" | "1991"| "1992" | "1993" | "1994" | "1995" | "1996" | "1997" | "1998" | "1999" | "2000" | "2001" | "2002" | "2003" | "2004" | "2005" | "2006" | "2007" | "2008" | "2009" | "2010" | "2011" | "2012" | "2013" | "2014" | "2015" | "2016" | "2017" | "2018" | "2019" | "2020" | "2021" | "2022" | "2023" | "2024" | "2025";
DateYear returns string: NUMBER+Dash+NUMBER+Dash+NUMBER;
DOI returns string: NUMBER+"/"+ID+"-"NUMBER+"-"+NUMBER+"-"+ID;

// Email
EmailType returns string: ID+'@'+ID+'.'+ID;





