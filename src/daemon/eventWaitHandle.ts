// We implement a poisonable EventWaitHandler. Whether are release()ed or poison()ed, all past and future calls to block
// will resolve() or reject() with the given value.
export default class EventWaitHandle<ReturnValue> {
    private _promise: Promise<void>;
    // _release will not exist for a short time after we are initialised.
    private _release?: () => void;
    private _resolved: boolean = false;
    private _rejected: boolean = false;
    private _resolvedValue?: ReturnValue;
    private _rejectedValue?: unknown;

    constructor() {
        this._promise = new Promise(release => {
            this._release = release;
        });
    }

    // Has poison() or release() already been called?
    hasCompleted(): boolean {
        return this._resolved || this._rejected;
    }

    // Release the lock. All calls to block() (past and future) will now resolve() with the value passed immediately.
    //
    // We will resolve() with true if release() or poision() have NOT been previously called, or otherwise resolve()
    // with false and PERFORM NO ACTION.
    async release(value: ReturnValue): Promise<boolean> {
        if (this._resolved || this._rejected) {
            return false;
        }

        this._resolved = true;
        this._resolvedValue = value;

        // _release is set asynchronously, but it should be done very fast, so we don't need to wait too long.
        while (!this._release) {
            await new Promise(r => setTimeout(r, 10));

        }
        this._release();

        return true;
    }

    // Poison the EventWaitHandler with the given reason. All calls to block (past or future) will now reject() with
    // reason.
    //
    // We will resolve() with true if release() or poision() have NOT been previously called, or otherwise resolve()
    // with false and PERFORM NO ACTION.
    async poison(reason?: unknown): Promise<boolean> {
        if (this._resolved || this._rejected) {
            return false;
        }

        this._rejected = true;
        this._rejectedValue = reason;

        // _release is set asynchronously, but it should be done very fast, so we don't need to wait too long.
        while (!this._release) {
            await new Promise(r => setTimeout(r, 10));

        }
        this._release();

        return true;
    }

    // Block until release() or poison() is called (or immediately if one of them has already been called). If poison()
    // was called, we will reject() with the reason passed to it.
    async block(): Promise<ReturnValue> {
        await this._promise;

        if (this._rejected == this._resolved) {
            throw 'unreachable';
        }

        if (this._resolved) {
            return this._resolvedValue;
        } else {
            throw this._rejectedValue;
        }
    }
}