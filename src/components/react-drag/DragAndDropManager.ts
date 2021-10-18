export default class DragAndDropManager {

    active: unknown;
    subscriptions: Array<{ id: number, callback: Function }>;
    id: number;
    constructor() {
        this.active = null
        this.subscriptions = []
        this.id = -1
    }

    setActive(activeProps: unknown) {
        this.active = activeProps
        this.subscriptions.forEach((subscription) => subscription.callback())
    }

    subscribe(callback: () => void) {
        this.id += 1
        this.subscriptions.push({
            callback,
            id: this.id,
        })

        return this.id
    }

    unsubscribe(id) {
        this.subscriptions = this.subscriptions.filter((sub) => sub.id !== id)
    }
}
