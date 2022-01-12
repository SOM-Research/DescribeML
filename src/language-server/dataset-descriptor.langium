grammar DatasetDescriptor

entry DescriptionDataset:
    (elements+=Declaration)*;

Declaration:
 (GeneralInfo | DatasetDefinition | Requeriments)*;

//
// Authoring
//
GeneralInfo:
     'General information:' name=ID 'Title:' title=STRING  'Version:' version=ID 'Description' description=STRING 'Citation:' STRING
     authoring = Authoring;

Authoring:
    'Auhors:' (authors+=Author)*
    'Founders:' (founders+=Founder)*
    'License Information:' licence = STRING // Aquí podriem aportar més ajuda sobre llicencies
    'Maintenance:' maintenance=Maintenance;

Author:
    'Name:' name=ID 'email:' email=STRING;

Founder:
    'Name' name=ID 'type:' type=FoundersType ('grantor:' grantor= STRING 'grantId:' ID)?;

Maintenance:
    'Maintainers' (maintainers+=Author)*
    ('Erratum?' erratum=STRING)? 
    ('Data Retention:' dataRetention=STRING)? 
    ('Version support:' support=STRING)? 
    ('Contribution guides:' contribGuides=STRING)?;

//
// Dataset Composition 
//
 DatasetDefinition:
     'Composition:' name=ID
     'General description:' description=STRING
     ('Number of instances:' numberInst=INT)? 
     'composedBy:' (instances+=Instance)*
     ('Instances Relation' relation=RelationInstances)?
     ('Privacy:' privacy=Privacy)? 
     ('Dependencies:' dependencies=Dependencies)? 
     ('Data Splits:' splits=STRING)? ;


// Instances definition
Instance: 
    'Instance:' name=ID 'description:' descript=STRING 'type:'  type=InsType  ('total number:' numIns=INT)?
        'withAttributes:' (attributes+=Attribute)*
        
    ('Instance belongs to people:' 
        'Have sensitive attributes?' ('attribute:' senseAtt=[Attribute])*
        'Are there protecte groups?' procGroups=STRING
        'Might be offensive' offDiscussion=STRING
    )?;

Attribute:
    'attribute' name=ID 'ofType' attType=ATtype 'description:' attdesc=STRING ;

// Relation between Instances
RelationInstances:
    ('Relation' name=ID 'attribute:' attRel=[Attribute] "is related to:" insRel=[Instance] ('and attribute:' attRelTarget=[Attribute])?)*;


// Privacy
Privacy: 
        'Legal Issues:' legal=STRING
        'Individual indetification:' indident= 'yes' | 'no';

// Dependencies
Dependencies:
        'Links:' 
            'Complete archival version:' archival=STRING
            'Restriction:' restriction=STRING
            'Rate Limit Usage:' limit=STRING;



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
            'where attribute:' att=[Attribute:QualifiedName] 'is from' lowrange=INT 'to' highrange=INT;

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
ATtype returns string: 'int' | 'string' | 'bool';
InsType returns string: 'people' | 'images' | 'raw' | 'features' | 'other';
FoundersType returns string: 'private' | 'public' | 'mixed';
Operation returns string: '<'|'>'|'='|'!='|'+'|'-';


// Terminals
hidden terminal WS: /\s+/;
terminal ID: '^'?(/[_a-zA-Z]/|'_')(/[_a-zA-Z]/|'_'|/[0-9]/)*;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"[^"]*"|'[^']*'/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
