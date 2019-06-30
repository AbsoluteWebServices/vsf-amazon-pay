// CollapseLib by Daniel Alabi (alabidan.me)
// isPlainObject is part of the jQuery source (I modified the method a little)

/**
 * Example use:
 * complicated = {"dict1key": {"dict2key": [{"dict3key": {"tell":"me"}}]}}
 *
 * let dict = CollapseLib.collapseDict(collapse);
 * console.log(JSON.stringify(dict, undefined, 2));
 *
 */
// todo: fix bug with empty plain object
export default {
  /**
   *
   * @warning allowed types for complexDict : {}, [], JS primitives (int, float, or string)
   *
   * @param complexDict : a JS object that might have inner JS objects and arrays OR
   *                      a JS array that might have inner JS objects and arrays OR
   * @param plainDict   : a one-level collapse JS object
   */

  // if you have an empty object, just return an empty object
  collapseDict (complexDict) {
  // make plain object to return
    let plainDict = {}
    let sawComplex = false
    let subDict

    if (this.isPlainObject(complexDict)) {
      // if complexDict is a JS object
      sawComplex = false
      for (let complexKey in complexDict) {
        // if complexDict[complexKey] is an inner dict
        if (this.isPlainObject(complexDict[complexKey])) {
          if (this.isEmptyObject(complexDict[complexKey])) {
            return complexDict
          }

          subDict = complexDict[complexKey]
          sawComplex = true
          for (let subKey in subDict) {
            plainDict[complexKey + '.' + subKey] = this.collapseDict(subDict[subKey])
          }
        } else if (Array.isArray && Array.isArray(complexDict[complexKey])) {
          if (!this.isComplexArray(complexDict[complexKey])) {
            plainDict[complexKey] = this.getStrFromArray(complexDict[complexKey])
          } else {
            sawComplex = true
            for (let i = 0; i < complexDict[complexKey].length; i++) {
              plainDict[complexKey + '[' + i + ']'] = this.collapseDict(complexDict[complexKey][i])
            }
          }
        } else {
          plainDict[complexKey] = this.collapseDict(complexDict[complexKey])
        }
      }
      if (sawComplex) {
        return this.collapseDict(plainDict)
      } else {
        return plainDict
      }
    } else {
      if (Array.isArray && Array.isArray(complexDict)) {
        plainDict = {}

        // if complexDict is an array
        // that contains an inner array or inner plain object
        if (this.isComplexArray(complexDict)) {
          for (let i = 0; i < complexDict.length; i++) {
            plainDict['[' + i + ']'] = this.collapseDict(complexDict[i])
          }
        }
        return this.collapseDict(plainDict)
      } else {
        return complexDict.toString()
      }
    }
  },
  isComplexArray (arr) {
    for (let i = 0; i < arr.length; i++) {
      if ((Array.isArray && Array.isArray(arr[i])) ||
      this.isPlainObject(arr[i])) {
        return true
      }
    }
    return false
  },
  getStrFromArray (arr) {
    return arr.toString()
  },
  isPlainObject (obj) {
    let hasOwn = Object.prototype.hasOwnProperty
    // Must be an Object.
    // Because of IE, we also have to check the presence of the constructor property.
    // Make sure that DOM nodes and window objects don't pass through, as well
    if (!obj || typeof obj !== 'object' || obj.nodeType) {
      return false
    }

    try {
      // Not own constructor property must be Object
      if (obj.constructor &&
    !hasOwn.call(obj, 'constructor') &&
    !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
        return false
      }
    } catch (e) {
      // IE8,9 Will throw exceptions on certain host objects #9897
      return false
    }

    // Own properties are enumerated firstly, so to speed up,
    // if last one is own, then all properties are own.
    let key
    for (key in obj) {} // eslint-disable-line no-empty

    return key === undefined || hasOwn.call(obj, key)
  },
  isEmptyObject (obj) {
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        return false
      }
    }
    return true
  }
}
