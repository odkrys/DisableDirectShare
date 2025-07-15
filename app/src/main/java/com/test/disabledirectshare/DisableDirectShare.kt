package com.test.disabledirectshare

import android.content.IntentFilter
import de.robv.android.xposed.IXposedHookLoadPackage
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers
import de.robv.android.xposed.callbacks.XC_LoadPackage

@Suppress("UNUSED")
class DirectShareHook : IXposedHookLoadPackage {
    override fun handleLoadPackage(lpparam: XC_LoadPackage.LoadPackageParam) {
        val targetPackages = listOf("android", "com.android.systemui")
        val targetProcesses = listOf("android", "android:ui")

        XposedBridge.log("[DirectShareHook] Loaded package: ${lpparam.packageName}, process: ${lpparam.processName}")

        if (lpparam.packageName !in targetPackages && lpparam.processName !in targetProcesses) return

        try {
            val clazz = XposedHelpers.findClass("android.content.pm.ShortcutManager", lpparam.classLoader)

            // Correctly hook getShareTargets with IntentFilter as an argument
            XposedHelpers.findAndHookMethod(
                clazz,
                "getShareTargets",
                IntentFilter::class.java,
                object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        val result = param.result ?: return

                        val className = result.javaClass.name
                        val methodName = param.method.name
                        val parameterTypes = XposedHelpers.getParameterTypes(param.method)
                        val methodSignature = "$methodName(${parameterTypes.joinToString { it.simpleName }})"

                        XposedBridge.log("[DirectShareHook] Hooked method: $methodSignature, result type: $className")

                        try {
                            when (className) {
                                "android.content.pm.ParceledListSlice" -> {
                                    val list = XposedHelpers.callMethod(result, "getList") as? MutableList<*>
                                    if (!list.isNullOrEmpty()) {
                                        val originalSize = list.size
                                        list.clear()
                                        XposedBridge.log("[DirectShareHook] Cleared ParceledListSlice contents. Original size: $originalSize")
                                    }
                                }
                                "java.util.ArrayList" -> {
                                    (result as? MutableList<*>)?.let {
                                        if (it.isNotEmpty()) {
                                            val originalSize = it.size
                                            it.clear()
                                            XposedBridge.log("[DirectShareHook] Cleared ArrayList contents. Original size: $originalSize")
                                        }
                                    }
                                }
                                else -> {
                                    XposedBridge.log("[DirectShareHook] Unhandled return type for $methodSignature: $className")
                                }
                            }
                        } catch (e: Throwable) {
                            XposedBridge.log("[DirectShareHook] Error while clearing result for $methodSignature: ${e.message}")
                            XposedBridge.log(e)
                        }
                    }
                }
            )
            XposedBridge.log("[DirectShareHook] Successfully set up hook for ShortcutManager.getShareTargets(IntentFilter)")

        } catch (e: Throwable) {
            XposedBridge.log("[DirectShareHook] Failed to set up hooks: ${e.message}")
            XposedBridge.log(e)
        }
    }
}