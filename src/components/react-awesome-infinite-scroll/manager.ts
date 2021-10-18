import { COMPONENT_TYPE } from "./core"

export default class DragAndDropManager {

    refreshType: `${COMPONENT_TYPE}`;
    loading: boolean;
    error: boolean;
    scrollHeight: number;
    pullDistance: number;
    length: number;
    finishTrigger?: boolean;
    forbidTrigger?: boolean;
    constructor() {
        this.refreshType = COMPONENT_TYPE.PULL;
        this.loading = false;
        this.error = false;
        this.scrollHeight = 0;
        this.pullDistance = 0;
        this.length = 0;
    }

    setFinishTrigger(val: boolean) {
        this.finishTrigger = val;
    }
    setLoading(val: boolean) {
        this.loading = val;
    }
    setPullDistance(val: number) {
        this.pullDistance = val;
    }
    setRefreshType(val: `${COMPONENT_TYPE}`) {
        this.refreshType = val;
    }
    setError(val: boolean) {
        this.error = val;
    }
    setScrollHeight(val: number) {
        this.scrollHeight = val;
    }
}
