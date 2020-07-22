export interface Translator {
    readonly objToRel: (str: string) => string;
    readonly relToObj: (str: string) => string;
}
export declare const camelToSnake: (str: any) => any;
export declare const snakeToCamel: (str: any) => any;
export declare const keyString: (input: any) => string;
export declare const valueString: (paramsObj: any) => string;
export declare const multiValueString: (inputArray: any) => any;
export declare const stringifyUpdates: (updatedFields: any) => string;
export declare const format: <T>(obj: T, relToObj: Translator['relToObj']) => {
    [x: string]: any;
};
export declare const defaultTranslator: Translator;
