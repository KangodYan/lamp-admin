import deepmerge from 'deepmerge';
import { isNil } from 'lodash';
import { MutableRefObject } from 'react';

import { TreeNode } from './types';

/**
 * 检测当前路径是否为一个URL
 * @param path 路径(字符串)
 */
export const isUrl = (path?: string): boolean => {
    if (isNil(path) || !path.startsWith('http')) return false;
    try {
        const url = new URL(path);
        return !!url;
    } catch (error) {
        return false;
    }
};

/**
 * 深度合并对象
 * @param x 初始值
 * @param y 新值
 * @param arrayMode 对于数组采取的策略,`replace`为直接替换,`merge`为合并数组
 */
export const deepMerge = <T1, T2>(
    x: Partial<T1>,
    y: Partial<T2>,
    arrayMode: 'replace' | 'merge' = 'merge',
) => {
    const options: deepmerge.Options = {};
    if (arrayMode === 'replace') {
        options.arrayMerge = (_d, s, _o) => s;
    } else if (arrayMode === 'merge') {
        options.arrayMerge = (_d, s, _o) => Array.from(new Set([..._d, ...s]));
    }
    return deepmerge(x, y, options) as T2 extends T1 ? T1 : T1 & T2;
};

/**
 * 检测当前函数是否为异步函数
 * @param callback 待检测函数
 */
export function isAsyncFn<R, A extends Array<any>>(
    callback: (...asgs: A) => Promise<R> | R,
): callback is (...asgs: A) => Promise<R> {
    const AsyncFunction = (async () => {}).constructor;
    return callback instanceof AsyncFunction === true;
}

/**
 * 防抖执行函数,在一段时间内只执行一次
 * @param ref 对比控制值
 * @param fn 执行的函数,可为异步
 * @param wait 间隔时间
 */
export const debounceRun = (
    ref: MutableRefObject<NodeJS.Timeout | undefined>,
    fn: (...args: any[]) => any,
    wait?: number,
) => {
    if (isNil(ref.current)) {
        clearTimeout(ref.current);
        ref.current = setTimeout(() => {
            if (isAsyncFn(fn)) {
                fn().then(() => {
                    ref.current = undefined;
                });
            } else {
                fn();
                ref.current = undefined;
            }
        }, wait ?? 10);
    }
};

/**
 * 递归遍历数结构
 */
export const traverseTree = (node: TreeNode) => {
    // 处理当前节点
    console.log(node.id); // 在这里执行你想要的操作

    // 递归处理子节点
    node.children.forEach((child) => {
        traverseTree(child);
    });
};

/**
 * 深度复制
 */
export function deepCopy(obj: any, cache = new WeakMap()): any {
    // 如果是基本数据类型或 null，则直接返回
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // 如果对象已经被复制过，直接返回缓存中的副本，避免无限循环
    if (cache.has(obj)) {
        return cache.get(obj);
    }

    // 根据原始对象的类型创建对应的空对象或数组
    const copy = Array.isArray(obj) ? [] : {};

    // 将当前对象存入缓存
    cache.set(obj, copy);

    // 递归复制对象的属性
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            copy[key] = deepCopy(obj[key], cache);
        }
    }

    return copy;
}
