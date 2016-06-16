/*
 * Copyright (c) 2015, University of California, Berkeley
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// Author: Michael Pradel (michael@binaervarianz.de)
//         Liang Gong (gongliang13@cs.berkeley.edu)
// Ported to Jalangi2 by Liang Gong

/**
 * @dlintShort{Find code that adds an enumerable property to Object.}
 * @dlintLong{Should be avoided because it affects every for..in loop in the program.}
 * @dlintShortName{EnumerableObjProps}
 * @dlintRule{Avoid adding enumerable properties to \code{Object}. Doing so affects every for-in loop.}
 * @dlintPattern{propWrite(Object,*,*) ORR
 * call(Object,defineProperty,args,*,*) WHERE args.length = 3 AND args[2].enumerable = true}
 * @dlintGroup{Inheritance}
 * @dlintMayNeedDynamic
 * @dlintSingleEventPattern
 */

(function(sandbox) {
    function MyAnalysis() {
        var iidToLocation = sandbox.iidToLocation;
        var Warning = sandbox.WarningSummary.Warning;

        var iidToCount = {};  // iid: number --> count: number

        this.invokeFunPre = function(iid, f, base, args, isConstructor, isMethod) {
            iid = sandbox.getGlobalIID(iid);
            if (f.name === "defineProperty" && base === Object && args[0] === Object.prototype &&
                  args.length === 3 && args[2].enumerable === true) {
                iidToCount[iid] = (iidToCount[iid] | 0) + 1;
            }
        };

        this.putField = function(iid, base, offset, val) {
            iid = sandbox.getGlobalIID(iid);
            if (base === Object.prototype) {
                iidToCount[iid] = (iidToCount[iid] | 0) + 1;
            }
        };

        this.endExecution = function() {
            var warnings = Object.keys(iidToCount).map(function(iid) {
                var location = iidToLocation(iid);
                return new Warning("AddEnumerablePropertyToObject", iid, location, "Adding an enumerable property to Object.prototype at " + location + " " + iidToCount[iid] + " time(s).", iidToCount[iid]);
            });
            sandbox.WarningSummary.addWarnings(warnings);
        };
    }
    sandbox.analysis = new MyAnalysis();
})(J$);