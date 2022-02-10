import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from 'langium';
import { datasetDescriptorAstType, Maintenance, GeneralInfo, Author, Founder, DatasetDefinition } from './generated/ast';
import { DatasetDescriptorServices } from './dataset-descriptor-module';

/**
 * Map AST node types to validation checks.
 */
type DatasetDescriptorChecks = { [type in datasetDescriptorAstType]?: ValidationCheck | ValidationCheck[] }

/**
 * Registry for validation checks.
 */
export class DatasetDescriptorValidationRegistry extends ValidationRegistry {
    constructor(services: DatasetDescriptorServices) {
        super(services);
        const validator = services.validation.DatasetDescriptorValidator;
        const checks: DatasetDescriptorChecks = {
            GeneralInfo: validator.hintsOfDescription,
            Author: validator.authorValidator,
            Founder: validator.hintsOfFounder,
            DatasetDefinition:validator.hintOfDatasetDefinition,
            Maintenance:validator.hintsofMaintenance
        };
        this.register(checks, validator);
    }
}

/**
 * Implementation of custom validations.
 */
export class DatasetDescriptorValidator {

    hintsOfDescription(type:GeneralInfo, accept: ValidationAcceptor): void {
          //  accept('warning', 'Version should have the following form: V000', { node: type, property: 'version' });
            accept('hint', '1 - For what propose was the dataser created? \n2 - Was there a specific task in mind?\n3 - Was there specific gap that needed to be filled?\nPlease provide a description', { node: type, property: 'description' });
       //     accept('hint', '1 - Who created the dataset for example, which team or research group?', { node: type, property:'authors'})
       //     accept('hint', '1 - Who founded the creation of the dataset?\n2 - If is there any associated grant, please provide the number and the name of the grantor and the gran name and number', { node: type, property: 'founders' });
           
    }

    
    hintsOfFounder(type: Founder, accept: ValidationAcceptor): void {
        
    }

    hintsofMaintenance(type:Maintenance, accept: ValidationAcceptor): void {
        accept('hint', 'Who maintan the dataset? How can be contacted?', { node: type, property: 'maintainers' });
        accept('hint', 'Is there an erratum? If so, please provide a link or other access point?', { node: type, property: 'erratum' });
        accept('hint', 'If the dataset belongs to people, are there applicable limits on the retention of the data associated with them? If so, please describre how. If not, please describre how its obsolescence will be communicated to the dataset', { node: type, property: 'dataRetention' });
        accept('hint', '1 - Will the dataset by updated (p.e: to correct labels, add or delete new instances)? If so, please describre how \n2 - Will older version of the dataset continue to be supported/hosted/maintained?', { node: type, property: 'support' });
        accept('hint', 'Please describre the mechanism for contribution here', { node: type, property: 'contribGuides' });
    }

    hintOfDatasetDefinition(type: DatasetDefinition, accept: ValidationAcceptor): void {
        accept('hint', 'What do the isntances that comprise the dataset represent(for example, documents, photos, people, countries)', { node: type, property: 'description' });
        accept('hint', 'How many instances are there in total?', { node: type, property: 'numberInst' });
    }
       

    authorValidator(type: Author, accept: ValidationAcceptor): void {
   
        if (type.name) {
            const firstChar = type.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Type name should start with a capital.', { node: type, property: 'name' });
            }
        }
    }

}
