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
     ('Release Date:' dates=STRING )?
     ('Citation:' citation=STRING)?
     'Description:' 
        (description=STRING | 
        (('Purposes:' descriptionpurpose=STRING)? 
         ('Tasks:' descriptionTasks=STRING)? 
         ('Gaps:' descriptionGaps=STRING)?)) 
     ('Licences:' licence=CommonLicences)?
     (uses=Applications)?
     (distribution=Distribution)?
     (area=Area)?
     (tags=Tags)?
      authoring=Authoring;

// Distribution Policies
Distribution:
    name="Distribution:"
    ("Is public?:" public=ID)?
    ("How is distributed:" past=STRING)?  
    ("Distribution license:" lic=STRING)?;

// Applications
Applications:
    name="Applications:"
    ("Past Uses:" (past+=STRING)*)?
    ("Recommneded:" (recommend+=STRING)*)?
    ("Non-recommended:" (future+=STRING)*)?
    ("Uses repository:" repo=STRING)?;
Area: name='Area:' area+=ID;
Tags: name='Tags:' (tags+=ID)*;

// Authoring
Authoring:
    name= 'Authoring:' 
    (authors+=Authors
      founding+= (Founders)?
      ('Maintainer:' (maintainers+=Maintainer)*)?
      ('Erratum?' erratum=STRING)? 
      ('Data Retention:' dataRetention=STRING)? 
      ('Version lifecycle' support=STRING)? 
      ('Contribution guidelines:' contribGuides=STRING)?);
Authors: 
    name='Authors:'  (authors+=Author*);
Author:
    'Name' name=ID 'email' email=STRING;
Founders: 
    name='Funders:'  (funders+=Funder)+;
Funder:
    'Name' name=ID 'type' type=FundersType ('grantor' grantor= STRING 'grantId:' ID)?;
Maintainer:
    'Name' name=ID 'email' email=STRING;

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
     ('Is sample:' sample=STRING)?
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
    ('Pair Correlation:' (pair+=PairCorrelation)*)?
    ('Quality Metrics:' metric+=QualityMetric)?;

PairCorrelation:
    (
        'between' attr1=[Attribute] 'and' 
        (attr2=[Attribute] | 'external source'
        'From:' from=STRING "Rationanle:" rationale=STRING)
    )?;

QualityMetric:
    ('Sparsity:' sparsity=NUMBER)?
    ('Compeleteness:' complet=NUMBER)?
    ('Class Balance' balance=STRING)?
    ('Noisy labels' noisy=STRING)?;

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
    ('Binary attribute:' binary=Binary)?
    ('Mode:' mode=STRING)?
    ('Categorical Distribution:' catdist=STRING)?)?
    ('Quality Metrics:' metrics+=QualityMetric)?;

Binary:
    'Symmetry:' sym=AttributeSymmetry
    'Attribute Sparsity:' attspar=NUMBER;
   
Numeri:
    name='Numerical' 
    (('Statistics:')
    ('Mean:' mean=NUMBER)?
    ('Median:' median=NUMBER)?
    ('Standard Desviation:' std=NUMBER)?
    ('Minimmum:' min=NUMBER)?
    ('Maximmum:' max=NUMBER)?
    ('Quartiles:' quartiles=STRING)?
    ('IQR:' iqr=NUMBER)?)?
    ('Quality Metrics:' metrics+=QualityMetric*)?;


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
    'Related Instances:' (mapInstance=[DataInstance] (',')?)*
    ('Social Issues' labelSocialIssues=[SocialIssue])?
    ('How data is collected:' how=GatherType)?
    ('Is language data?:' SpeechSitatuion)?
    ('When data was collected:' when=STRING)?
    ('Process Demographics:' processDemo = Demographics)?
    ('Gathering Team:' gatheringTeam = Team)?
    ('Gather Requeriments' (requeriments+=Requeriments)*)?;

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
    'Requeriment:'
    req=STRING;




// Labeling
LabelingProcesses: 
    name='LabelingProcesses:' (labprocesses+=LabelingProcess)*;
LabelingProcess:
    'Labeling process:' name=ID
    'Description:' desc=STRING
    'Type:' type=AnnotationType
    ('Labels:' (Labels)*)?
    ('Labeling Team:'labelingTeam = Team)?
    ('Social Issues' labelSocialIssues=[SocialIssue])?
    ('Label Requeriments' (requeriments+=Requeriments)*)?;
Labels:
    'Label:' name=ID
    'Description:' desc=STRING
    'Mapping:' (map=[Attribute] (',')?)*;

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
        ('Are there protecte groups?' procGroups=STRING)?
        ('Might be offensive' offDiscussion=STRING)?)?
    ;

    


// Semantical Type Rules

CommonLicences returns string: 'Creative Commons' | 'CC0: Public Domain' | 'CC BY-NC-SA 4.0' | 'CC BY-SA 4.0' |'CC BY-SA 3.0' |'CC BY 4.0 (Attribution 4.0 International)' |'CC BY-NC 4.0 (Attribution-NonCommercial 4.0 International)' |'CC BY 3.0 (Attribution 3.0 Unported)' | 'CC BY 3.0 IGO (Attribution 3.0 IGO)'| 'CC BY-NC-SA 3.0 IGO (Attribution-NonCommercial-ShareAlike 3.0 IGO)' | 'CC BY-ND 4.0 (Attribution-NoDerivatives 4.0 International)'

                                | 'CC BY-NC-ND 4.0 (Attribution-NonCommercial-NoDerivatives 4.0 International)' | 'GPL' | 'GPL 2' | 'LGPL 3.0 (GNU Lesser General Public License 3.0)' | 'AGPL 3.0 (GNU Affero General Public License 3.0)'

                                | 'FDL 1.3 (GNU Free Documentation License 1.3)' | 'Open Data Commons' |'Database: Open Database, Contents: Database Contents' |'Database: Open Database, Contents: © Original Authors' | 'PDDL (ODC Public Domain Dedication and Licence)' | 'ODC-BY 1.0 (ODC Attribution License)'

                                | 'Community Data License' | 'Community Data License Agreement - Permissive - Version 1.0' | 'Community Data License Agreement - Sharing - Version 1.0' | 'Special' | 'World Bank Dataset Terms of Use' | 'Reddit API Terms' | 'U.S. Government Works' | 'EU ODP Legal Notice';

InstanceType returns string: 'Record-Data' | 'Time-Series' | 'Ordered' | 'Graph' | 'Other';
FundersType returns string: 'private' | 'public' | 'mixed';
AttributeSymmetry returns string: 'Symmetric' | 'Asymmetric';
AnnotationType returns string: 'Bounding boxes' | 'Lines and splines' | 'Semantinc Segmentation' | '3D cuboids' | 'Polygonal segmentation' | 'Landmark and key-point' | 'Image and video annotations' | 'Entity annotation' | 'Content and text categorization';
SocialIssueType returns string: 'Privacy' | 'Bias' | 'Sensitive Data' | 'Social Impact';
GatherType returns string: 'API' | 'Sensors' | 'Manual Human Curator' | 'Software' | 'Others';
TeamType returns string: 'Internal' | 'External' | 'Contractors' | 'Crowdsourcing';
SpeechModality returns string: 'spoken/signed' | 'written';
SpeechType returns string: 'Scripted/edited' | 'spontaneous';
SpeechSyncrony returns string: 'synchronous interaction' | 'asynchronous intercation';

// Logic Data Types
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
