import { TModelResponse } from "../../models/modelResponse";


export const unique = <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
};

export class ModelResponse {
    public type: string;
    public model: any;
    public children: {[type: string]: any[]} = {};
    public parent: ModelResponse | undefined;

    constructor(type: string, model: any, parent?: ModelResponse) {
        this.type = type;
        this.model = model;
        this.parent = parent;
    }

    static merge(responses: ModelResponse[]) {
        if (responses.length === 0) {
            return new ModelResponse('user', []);
        } else {
            if (responses.every(r => r.type === responses[0].type)) {
                const models = responses.map(r => r.model);
                const response = new ModelResponse(responses[0].type, models);
                response.addAllChildren(responses, true);
                return response;
            } else {
                throw new Error('Cannot merge responses of different type');
            }
        }
    }

    add(type: string, values: any[]) {
        if (!this.children[type]) {
            this.children[type] = unique(values);
        } else {
            this.children[type] = unique([...this.children[type], ...values]);
        }
    }

    addChildren(response: ModelResponse, skipRoot: boolean = false) {
        if (response.type !== '') {
            if (!skipRoot) {
                this.add(response.type, [response.model]);
            }
            Object.entries(response.children).forEach(([key, value]) => {
                this.add(key, value);
            });
        }
    }

    addAllChildren(responses: ModelResponse[], skipRoot: boolean = false)  {
        responses.forEach(response => {
            this.addChildren(response, skipRoot);
        });
    }

    has(type: string, id: string): boolean {
        return this.model.id === id
               || Object.values(this.children).some(models => models.some(m => m.id === id))
               || (this.parent !== undefined && this.parent.has(type, id));
    }

    build() {
        if (this.type === '') {
            return {};
        } else {
            return TModelResponse.toTransit({ model: this.model, children: this.children });
        }
    }
}
