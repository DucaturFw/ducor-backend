;(function() {
  function oraclized(
    it
    /*``*/
  ) {
    var out =
      '#include <eosiolib/eosio.hpp>\n#include <eosiolib/singleton.hpp>\n#include "oraclized.hpp"\n\nusing namespace eosio;\n\n'
    var arr1 = it.customs
    if (arr1) {
      var c,
        i1 = -1,
        l1 = arr1.length - 1
      while (i1 < l1) {
        c = arr1[(i1 += 1)]
        out += "struct " + c.name + "\n{\n  "
        var arr2 = c.fields
        if (arr2) {
          var f,
            i2 = -1,
            l2 = arr2.length - 1
          while (i2 < l2) {
            f = arr2[(i2 += 1)]
            out += "" + f.type + " " + f.name + ";\n  "
          }
        }
        out += "\n\n  EOSLIB_SERIALIZE(" + c.name + ", "
        var arr3 = c.fields
        if (arr3) {
          var f,
            i3 = -1,
            l3 = arr3.length - 1
          while (i3 < l3) {
            f = arr3[(i3 += 1)]
            out += "(" + f.name + ")"
          }
        }
        out += ")\n};\n"
      }
    }
    out += "\n"
    var arr4 = it.providers
    if (arr4) {
      var p,
        i4 = -1,
        l4 = arr4.length - 1
      while (i4 < l4) {
        p = arr4[(i4 += 1)]
        out +=
          "\ntypedef oraclized<N(" +
          p.alias +
          "), " +
          p.bestBefore +
          ", " +
          p.updateAfter +
          ", " +
          p.type +
          "> " +
          p.name +
          "_data;"
      }
    }
    out +=
      "\ntypedef singleton<N(master), account_name> oraclize_master;\n\nclass YOUR_CONTRACT_NAME : public eosio::contract\n{\nprivate:\n"
    var arr5 = it.providers
    if (arr5) {
      var p,
        i5 = -1,
        l5 = arr5.length - 1
      while (i5 < l5) {
        p = arr5[(i5 += 1)]
        out += "\n  " + p.name + "_data " + p.name + ";"
      }
    }
    out +=
      "\n\n  account_name master;\n\npublic:\n  using contract::contract;\n\n  YOUR_CONTRACT_NAME(account_name s) : contract(s)"
    var arr6 = it.providers
    if (arr6) {
      var p,
        i6 = -1,
        l6 = arr6.length - 1
      while (i6 < l6) {
        p = arr6[(i6 += 1)]
        out += ", " + p.name + "(_self, _self)"
      }
    }
    out +=
      "\n  {\n    master = oraclize_master(_self, _self).get_or_create(_self, N(undefined));\n  }\n\n  void setup(account_name administrator, account_name master, account_name registry)\n  {\n    require_auth(_self);\n    oraclize_master(_self, _self).set(master, _self);\n    "
    var arr7 = it.providers
    if (arr7) {
      var p,
        i7 = -1,
        l7 = arr7.length - 1
      while (i7 < l7) {
        p = arr7[(i7 += 1)]
        out += 'ask_data(administrator, registry, "' + p.id + '");\n    '
      }
    }
    out +=
      "\n  }\n\n  void ask_data(account_name administrator, account_name registry, std::string data)\n  {\n    action(permission_level{administrator, N(active)},\n           registry, N(ask),\n           std::make_tuple(administrator, _self, data))\n        .send();\n  }"
    var arr8 = it.endpoints
    if (arr8) {
      var e,
        i8 = -1,
        l8 = arr8.length - 1
      while (i8 < l8) {
        e = arr8[(i8 += 1)]
        out +=
          "\n  \n  void push" +
          e.suffix +
          "(account_name oracle, std::string data_id, " +
          e.type +
          " data) \n  {\n    require_auth(oracle);\n    "
        var arr9 = it.providers
        if (arr9) {
          var p,
            i9 = -1,
            l9 = arr9.length - 1
          while (i9 < l9) {
            p = arr9[(i9 += 1)]
            if (p.type === e.type) {
              out +=
                '\n    if (strcmp(data_id.c_str(), "' +
                p.id +
                '") == 0) \n    {\n      ' +
                p.name +
                ".set(data, oracle);\n    }"
            }
          }
        }
        out += "\n  }"
      }
    }
    out += "\n};\n\nEOSIO_ABI(YOUR_CONTRACT_NAME, (setup)"
    var arr10 = it.endpoints
    if (arr10) {
      var e,
        i10 = -1,
        l10 = arr10.length - 1
      while (i10 < l10) {
        e = arr10[(i10 += 1)]
        out += "(push" + e.suffix + ")"
      }
    }
    out += ")"
    return out
  }
  var itself = oraclized,
    _encodeHTML = (function(doNotSkipEncoded) {
      var encodeHTMLRules = {
          "&": "&#38;",
          "<": "&#60;",
          ">": "&#62;",
          '"': "&#34;",
          "'": "&#39;",
          "/": "&#47;"
        },
        matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g
      return function(code) {
        return code
          ? code.toString().replace(matchHTML, function(m) {
              return encodeHTMLRules[m] || m
            })
          : ""
      }
    })()
  if (typeof module !== "undefined" && module.exports) module.exports = itself
  else if (typeof define === "function")
    define(function() {
      return itself
    })
  else {
    window.render = window.render || {}
    window.render["oraclized"] = itself
  }
})()
