grammar DatasetDescriptor

entry DescriptionDataset:
    (elements+=Declaration)*;

Declaration:
 'Dataset:' name=ID 
  generalinfo=GeneralInfo
  composition=Composition 
  socialConcerns=SocialConcerns
  provenance=DataProvenance;



//
// Authoring
//
GeneralInfo:
     name= 'Metadata:'
     'Title:' title=STRING 
     'Unique-identifier:' ident=ID
     'Version:' version=ID 
     'Description:' 
        (description=STRING | 
        (('Purpose:' descriptionpurpose=STRING)? 
         ('Tasks:' descriptionTasks=STRING)? 
         ('Gaps:' descriptionGaps=STRING)?  
         ('Citation:' citation=STRING)?)) 
     (uses=Uses)?
     (distribution=Distribution)?
     (area=Area)?
     (tags=Tags)?
      authoring=Authoring  ;
   
Area:
    name='Area:' area+=ID;
Tags:
    name='Tags:' (tags+=ID)*;
Authoring:
    name= 'Authoring:' 
     (authors+=Authors
        founding+= (Founders)?
        'License Information:' licence = STRING 
        maintenance+=Maintenance);
Authors: 
    name='Authors:'  (authors+=Author*);

Author:
    'Name' name=ID 'email' email=STRING;

Founders: 
    name='Founders:'  (founders+=Founder)+;

Founder:
    'Name' name=ID 'type' type=FoundersType ('grantor' grantor= STRING 'grantId:' ID)?;

Maintenance: 
    name='Maintenance:'
    ('Maintainer:' (maintainers+=Maintainer)*)?
    ('Erratum?' erratum=STRING)? 
    ('Data Retention:' dataRetention=STRING)? 
    ('Version support' support=STRING)? 
    ('Contribution guides:' contribGuides=STRING)?;

Maintainer:
    'Name' name=ID 'email' email=STRING;

Distribution:
    name="Distribution:"
    ("Is public?:" public=ID)?
    ("How is distributed:" past=STRING)?  
    ("Distribution license:" past=STRING)?;
Uses:
    name="Uses:"
    ("Past Uses:" past=STRING)?
    ("Recommneded Uses:" recommend=STRING)?
    ("Non-recommended Uses:" future=STRING)?
    ("Uses repository:" repo=STRING)?;
//
// Dataset Composition 
//
 Composition:
     name='Composition:'
     'Description:' compodesc+=STRING
     ('Total number of instances:' numberInst=NUMBER)? 
     (instances += Instances)*
     (relation=RelationInstances)?
     ('Dependencies:' dependencies=Dependencies)? 
    ('Is sample:' sample=STRING)?
     ('Data Splits:' splits=STRING)?;


Instances:
    name='Instances:' (instances+=Instance)*;

// Instance definition
Instance: 
    // Qualitative
    'Instance:' name=ID 
    'Description:' descript=STRING 
    'Type:'  type=InsType  
    ('Number of attributes:' numIns=NUMBER)?
    ('Related Labels:' labels=[Labels])?
    ('Number of Records:' records=NUMBER)?
    ('Attributes:' (attributes+=Attribute)*)?

    // Statistical
    ((statistics+=InstanceStatistics)*)?

    // Quality
    ((dataQuality+=DataQuality)*)?
    ('Consistency rules:' (rules+=IntegrityRules)*)? 
   ;

InstanceStatistics:
    name="Instance Statistics:"
    (('Pair Plot:' plot+=STRING)*)?;

DataQuality:
    name="Data Quality:"
    ('Sparsity:' sparsity=NUMBER)?
    ('Compeletness:' complet=NUMBER)?
    ('Class Balance' balance=STRING)?
    ('Noisy labels' noisy=STRING)?
    ;
IntegrityRules:
    'Description:' desc=STRING;

Attribute:
    'attribute:' name=ID 
    'description:' attdesc=STRING 
    ('unique:' unique=NUMBER)?
    ('completness:' completnessAtt=NUMBER)?
    ('count:' completnessAtt=NUMBER)?
    ('ofType:' ((attType=Categor)|(attType=Numeri)))? ;

Categor:
    name='Categorical'
    ('Binary attribute:' binary=Binary)?
    ('Mode:' mode=STRING)?
    ('Categoric Distribution:' catdist=STRING)?;

Binary:
    'Symetry:' sym=Symetric
    'Attribute Sparsity:' attspar=NUMBER;
   
Numeri:
    name='Numerical' 
    ('Mean:' mean=NUMBER)?
    ('Median:' median=NUMBER)?
    ('Standard Desviation:' std=NUMBER)?
    ('Minimmum:' min=NUMBER)?
    ('Maximmum:' max=NUMBER)?
    ('Quartiles:' quartiles=STRING)?
    ('IQR:' iqr=NUMBER)?
    ;



// Relation between Instances
RelationInstances:
    'Instaces relation:' (relation+=Relation)*;

Relation:
    ('Relation:' name=ID 'attribute:' attRel=[Attribute] "is related to:" insRel=[Instance] ('and attribute:' attRelTarget=[Attribute]))*;




// Dependencies
Dependencies:
        "Description:" desc=STRING
        ('Links:' 
            'Complete archival version:' archival=STRING
            'Restriction:' restriction=STRING
            'Rate Limit Usage:' limit=STRING)?;


SocialConcerns:
    name='Social Concerns:'
    ('Privacy:' privacy+=Privacy)?
    ('Sensitive Data:' sensitive = SensitiveData)?
    ('Social Impact:' impact=STRING)?
    ('Bias discussion:' bias=STRING)?
    ;

SensitiveData:
    ('Description:' desc=STRING)?
    ('Instance belongs to people:' 
        ('Have sensitive attributes?' ('attribute:' senseAtt=[Attribute])*)?
        ('Are there protecte groups?' procGroups=STRING)?
        ('Might be offensive' offDiscussion=STRING)?)?
    ;
// Privacy
Privacy: 
        'Legal Issues:' legal=STRING
        ('Attributes affected:' (priva=[Attribute] (',')?)*)?;


// Provenance
DataProvenance:
    name='Data Provenance:'
    'Curation Rationale:' curation=STRING
    (datasources+=DataSources)?
    (annotations+=Annotators)?;

DataSources:
    name='Data Sources:' (datasources+=DataSource)*;

DataSource:
    'Source:' name=ID
    'Description:' desc=STRING
    'Related Instances:' (mapInstance=[Instance] (',')?)*
    'How data is collected:' how=STRING
    'Who collects the data:' who=STRING
    'Noise Sources:' noise=STRING
    'Privacy:' priv=STRING;

Annotators: 
    name='Data Preprocessing:' (annotations+=Annotator);

Annotator:
    'Labeling process:' name=ID
    'Description:' desc=STRING
    'Type:' type=AnnotationType
    ('Labels:' (Labels)*)?
    'Who annotates the data:' who=STRING
    'Process Requeriments' req=STRING;

Labels:
    'Label:' name=ID
    'Description:' desc=STRING
    'Mapping:' (map=[Attribute] (',')?)*;


// Requeriments
Requeriments:
    'Requeriments:' requeriments+=(Requeriment)*;

Requeriment:
     'Requeriment:' name=ID 'reportedby:' reporter=[Author]  action=(AccuracyRq | ConsistencyRq | CompletnessRq);  

AccuracyRq:
    'Accuracy Requeriment of' typeAcc=(DataTypeConstraints | RangeConstraints | MandatoryConstraints);

    DataTypeConstraints:
        'Data Type:' 
            'where attribute:' att=[Attribute:QualifiedName] 'is from type:' dataType=DataTypes;

    RangeConstraints:
        'Range:' 
            'where attribute:' att=[Attribute:QualifiedName] 'is from' lowrange=NUMBER 'to' highrange=NUMBER;

    MandatoryConstraints:
        'Mandatory:' 
            'where attribute:' att=[Attribute:QualifiedName] 'need to:' mandatory=STRING;

ConsistencyRq:
    'Consisntecy Requeriment of' typeConst=(Sintactic | Semantic);

    Sintactic:
        'Sintactic:'
            'where attribute:'  attObject=[Attribute:QualifiedName] 'needs to be:' operation=Operation 'than attribute:' attTarget=[Attribute:QualifiedName];

    Semantic:
        'Semantic:'
            'where attribute' attObject=[Attribute:QualifiedName] 'need to have a distribution: of' distribution=STRING;


CompletnessRq:
    'Completness Requeriments of' typeComplet=('Type' |'Column Completness' |'Tuple Completness'| 'Overall Completness' | 'Population Completness');
    


// Data Type Rules
QualifiedName returns string: ID ('.' ID)*;
DataTypes returns string: 'String' | 'Integer' | 'Boolean' | 'Other';
ATtype returns string: 'type';
InsType returns string: 'Record_Data' | 'Time-Series' | 'Ordenred' | 'Graph' | 'Other';
FoundersType returns string: 'private' | 'public' | 'mixed';
Operation returns string: '<'|'>'|'='|'!='|'+'|'-';
Categoric returns string: 'Categoric:';
Numeric returns string: 'Numeric:';
Symetric returns string: 'Symmetric' | 'Asymmetric';
Proven returns string: 'Data_Provenance';
Social returns string: 'Social_Concerns';
AnnotationType returns string: 'Bounding boxes' | 'Lines and splines' | 'Semantinc Segmentation' | '3D cuboids' | 'Polygonal segmentation' | 'Landmark and key-point' | 'Image and video annotations' | 'Entity annotation' | 'Content and text categorization';

// Terminals
hidden terminal WS: /\s+/;
terminal ID: '^'?(/[_a-zA-Z]/|'_')(/[_a-zA-Z]/|'_'|/[0-9]/)*;
terminal NUMBER returns number: /[0-9]+(\.[0-9])?/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
