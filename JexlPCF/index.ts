import {IInputs, IOutputs} from "./generated/ManifestTypes";
import Jexl = require('jexl');


export class JexlPCF implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    private _label: HTMLLabelElement;
    private _notifyOutputChanged: () => void;
    private _data : string;
    private _expression: string;
    private _output: string
    private  _jexl = new Jexl.Jexl();

    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        this._notifyOutputChanged = notifyOutputChanged;
        this._label = document.createElement('label');
        this._label.id="outputlabel";
        this._label.style.display='flex';
        container.append(this._label);
    }

    private evaluateExpression(data: string, expr: string){

        // Create a Jexl instance
        //const jexl = new Jexl.Jexl();

        const Data = JSON.parse(data);
        const Expression = expr;

        // Evaluate the expression
        this._jexl.eval(Expression,Data)
            .then((result: any) => {
                this._output = result;
                this._label.innerHTML=result;
                console.log(`Result: ${result}`);
                this._notifyOutputChanged();
            })
            .catch((error: any) => {
                console.log(`Error: ${error}`);
                // Handle the error
                this._label.innerHTML="";
                this._notifyOutputChanged();
            });
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        //if(context.updatedProperties.indexOf('Data')>-1 || context.updatedProperties.indexOf('Expression')>-1){
              // Add code to update control view

        if(this._data !== context.parameters.Data.raw||"" || this._expression !== context.parameters.Expression.raw||""){
            console.log("--- udpateViewTriggered! ---");

            this._data = context.parameters.Data.raw||"";
            this._expression = context.parameters.Expression.raw||"";
            this.evaluateExpression(this._data,this._expression);
        }
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
            Output: this._label.innerHTML //this._output
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
    }
}
