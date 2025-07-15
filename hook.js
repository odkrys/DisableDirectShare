// hook.js
Java.perform(function() {
    console.log("DirectShareBlocker: Frida script started!");

    // --------------------------------------------------------------------------
    // 1. ChooserActivity.queryDirectShareTargets 후킹 (유지 - 관찰용)
    // --------------------------------------------------------------------------
    try {
        const ChooserActivity = Java.use("com.android.internal.app.ChooserActivity");
        ChooserActivity.queryDirectShareTargets.overload(
            'com.android.internal.app.ChooserListAdapter',
            'boolean'
        ).implementation = function(adapter, includeShareTargets) {
            console.log("--------------------------------------------------");
            console.log("DirectShareBlocker [ChooserActivity Hook]: queryDirectShareTargets called!");
            console.log("Arguments:");
            console.log("  adapter (ChooserListAdapter): " + adapter);
            console.log("  includeShareTargets (boolean): " + includeShareTargets);

            const result = this.queryDirectShareTargets(adapter, includeShareTargets);

            console.log("Return value (possible Direct Share Targets list): " + (result ? JSON.stringify(result) : 'null'));
            console.log("Return value type: " + (result ? result.$className : 'null'));

            console.log("--------------------------------------------------");
            return result;
        };
        console.log("DirectShareBlocker: Successfully hooked ChooserActivity.queryDirectShareTargets.");
    } catch (e) {
        console.error("DirectShareBlocker: Error hooking ChooserActivity.queryDirectShareTargets: " + e.message);
    }

    // --------------------------------------------------------------------------
    // 2. ResolverActivityStubImpl 메서드 후킹 (유지 - 관찰용)
    // --------------------------------------------------------------------------
    const ResolverActivityStubImpl = Java.use("com.android.internal.app.ResolverActivityStubImpl");

    // useAospShareSheet (원래 동작 관찰)
    try {
        ResolverActivityStubImpl.useAospShareSheet.implementation = function() {
            console.log("--------------------------------------------------");
            console.log("DirectShareBlocker [ResolverActivityStubImpl Hook]: useAospShareSheet called!");
            const result = this.useAospShareSheet();
            console.log("Return value: " + result);
            console.log("--------------------------------------------------");
            return result;
        };
        console.log("DirectShareBlocker: Successfully hooked ResolverActivityStubImpl.useAospShareSheet (observing original behavior).");
    } catch (e) {
        console.error("DirectShareBlocker: Error hooking ResolverActivityStubImpl.useAospShareSheet: " + e.message);
    }

    // processRecommendedApp (유지)
    try {
        ResolverActivityStubImpl.processRecommendedApp.implementation = function() {
            console.log("--------------------------------------------------");
            console.log("DirectShareBlocker [ResolverActivityStubImpl Hook]: processRecommendedApp called!");
            console.log("Arguments: " + JSON.stringify(Array.prototype.slice.call(arguments)));
            const result = this.processRecommendedApp.apply(this, arguments);
            console.log("Return value: " + JSON.stringify(result));
            console.log("--------------------------------------------------");
            return result;
        };
        console.log("DirectShareBlocker: Successfully hooked ResolverActivityStubImpl.processRecommendedApp.");
    } catch (e) {
        console.error("DirectShareBlocker: Error hooking ResolverActivityStubImpl.processRecommendedApp: " + e.message);
    }

    // shouldRecommend (유지)
    try {
        ResolverActivityStubImpl.shouldRecommend.implementation = function() {
            console.log("--------------------------------------------------");
            console.log("DirectShareBlocker [ResolverActivityStubImpl Hook]: shouldRecommend called!");
            console.log("Arguments: " + JSON.stringify(Array.prototype.slice.call(arguments)));
            const result = this.shouldRecommend.apply(this, arguments);
            console.log("Return value: " + JSON.stringify(result));
            console.log("--------------------------------------------------");
            return result;
        };
        console.log("DirectShareBlocker: Successfully hooked ResolverActivityStubImpl.shouldRecommend.");
    } catch (e) {
        console.error("DirectShareBlocker: Error hooking ResolverActivityStubImpl.shouldRecommend: " + e.message);
    }

    // filterDisplayResolveInfo (유지)
    try {
        ResolverActivityStubImpl.filterDisplayResolveInfo.implementation = function() {
            console.log("--------------------------------------------------");
            console.log("DirectShareBlocker [ResolverActivityStubImpl Hook]: filterDisplayResolveInfo called!");
            console.log("Arguments: " + JSON.stringify(Array.prototype.slice.call(arguments)));
            const result = this.filterDisplayResolveInfo.apply(this, arguments);
            console.log("Return value: " + JSON.stringify(result));
            console.log("--------------------------------------------------");
            return result;
        };
        console.log("DirectShareBlocker: Successfully hooked ResolverActivityStubImpl.filterDisplayResolveInfo.");
    } catch (e) {
        console.error("DirectShareBlocker: Error hooking ResolverActivityStubImpl.filterDisplayResolveInfo: " + e.message);
    }

    // --------------------------------------------------------------------------
    // 3. AppPredictionManager 클래스의 모든 메서드 후킹 (관찰용)
    // --------------------------------------------------------------------------
    try {
        const AppPredictionManager = Java.use("android.app.prediction.AppPredictionManager");
        AppPredictionManager.class.getDeclaredMethods().forEach(function(method) {
            const methodName = method.getName();
            const methodArgs = method.getParameterTypes().map(function(type) { return type.getName(); });

            try {
                const overload = AppPredictionManager[methodName].overload.apply(AppPredictionManager[methodName], methodArgs);

                overload.implementation = function() {
                    console.log("DirectShareBlocker [AppPredictionManager Hook]: Called method: " + methodName + "(" + methodArgs.join(", ") + ")");
                    console.log("DirectShareBlocker [AppPredictionManager Hook]: Args values: " + Array.prototype.slice.call(arguments).map(arg => typeof arg === 'object' && arg !== null ? arg.$className || arg.toString() : arg).join(", "));
                    const result = overload.apply(this, arguments);
                    console.log("DirectShareBlocker [AppPredictionManager Hook]: Return value: " + (result ? (typeof result === 'object' ? result.$className || result.toString() : result) : 'null'));
                    return result;
                };
            } catch (e) {
                // console.warn("DirectShareBlocker: Could not hook AppPredictionManager method " + methodName + ": " + e.message);
            }
        });
        console.log("DirectShareBlocker: Successfully attempted to broadly hook AppPredictionManager methods for diagnosis.");
    } catch (e) {
        console.error("DirectShareBlocker: Error broadly hooking AppPredictionManager methods: " + e.message);
    }

    // --------------------------------------------------------------------------
    // 4. AppPredictor 클래스의 모든 메서드 후킹 (관찰용)
    // --------------------------------------------------------------------------
    try {
        const AppPredictor = Java.use("android.app.prediction.AppPredictor");
        AppPredictor.class.getDeclaredMethods().forEach(function(method) {
            const methodName = method.getName();
            const methodArgs = method.getParameterTypes().map(function(type) { return type.getName(); });

            try {
                const overload = AppPredictor[methodName].overload.apply(AppPredictor[methodName], methodArgs);

                overload.implementation = function() {
                    console.log("DirectShareBlocker [AppPredictor Hook]: Called method: " + methodName + "(" + methodArgs.join(", ") + ")");
                    console.log("DirectShareBlocker [AppPredictor Hook]: Args values: " + Array.prototype.slice.call(arguments).map(arg => typeof arg === 'object' && arg !== null ? arg.$className || arg.toString() : arg).join(", "));
                    const result = overload.apply(this, arguments);
                    console.log("DirectShareBlocker [AppPredictor Hook]: Return value: " + (result ? (typeof result === 'object' ? result.$className || result.toString() : result) : 'null'));
                    return result;
                };
            } catch (e) {
                // console.warn("DirectShareBlocker: Could not hook AppPredictor method " + methodName + ": " + e.message);
            }
        });
        console.log("DirectShareBlocker: Successfully attempted to broadly hook AppPredictor methods for diagnosis.");
    } catch (e) {
        console.error("DirectShareBlocker: Error broadly hooking AppPredictor methods: " + e.message);
    }

    // --------------------------------------------------------------------------
    // 5. ShortcutManager.getShareTargets 후킹 (다이렉트 공유 목록 비우기) - 일반 후킹 방식
    // --------------------------------------------------------------------------
    try {
        const ShortcutManager = Java.use("android.content.pm.ShortcutManager");

        // ShortcutManager의 모든 선언된 메서드를 반복합니다.
        ShortcutManager.class.getDeclaredMethods().forEach(function(method) {
            const methodName = method.getName();

            // 메서드 이름이 'getShareTargets'인 경우
            if (methodName === 'getShareTargets') {
                const methodArgs = method.getParameterTypes().map(function(type) { return type.getName(); });

                // 해당 오버로드를 후킹 시도
                try {
                    const overload = ShortcutManager[methodName].overload.apply(ShortcutManager[methodName], methodArgs);

                    overload.implementation = function() {
                        console.log("--------------------------------------------------");
                        console.log("DirectShareBlocker [ShortcutManager Hook]: getShareTargets called! (Generic hook targeting for clearing)");
                        console.log("Method Signature: " + methodName + "(" + methodArgs.join(", ") + ")"); // 호출된 메서드의 정확한 시그니처 로깅
                        console.log("Arguments (dynamic): " + Array.prototype.slice.call(arguments).map(arg => typeof arg === 'object' && arg !== null ? arg.$className || arg.toString() : arg).join(", "));

                        const originalResult = overload.apply(this, arguments);

                        console.log("Original Return value (Share Targets list): " + (originalResult ? originalResult.$className : 'null'));
                        if (originalResult && originalResult.$className === 'android.content.pm.ParceledListSlice') {
                            const list = originalResult.getList();
                            console.log("Original ParceledListSlice size: " + list.size());
                            if (list.size() > 0) {
                                list.clear();
                                console.log("DirectShareBlocker: Cleared ShortcutManager.getShareTargets ParceledListSlice!");
                            }
                            return originalResult;
                        } else if (originalResult && originalResult.$className === 'java.util.ArrayList') {
                            console.log("Original ArrayList size: " + originalResult.size());
                            if (originalResult.size() > 0) {
                                originalResult.clear();
                                console.log("DirectShareBlocker: Cleared ShortcutManager.getShareTargets ArrayList!");
                            }
                            return originalResult;
                        }

                        console.log("--------------------------------------------------");
                        return originalResult;
                    };
                    console.log("DirectShareBlocker: Successfully hooked ShortcutManager.getShareTargets (generic by name) to clear direct share list: " + methodName + "(" + methodArgs.join(", ") + ")");
                } catch (e) {
                    console.error("DirectShareBlocker: Could not hook specific overload for getShareTargets (" + methodName + "(" + methodArgs.join(", ") + ")): " + e.message);
                }
            }
        });
    } catch (e) {
        console.error("DirectShareBlocker: Error broadly searching/hooking ShortcutManager methods: " + e.message);
    }
});