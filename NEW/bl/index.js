'use strict';

const async = require("async");
const fs = require("fs");

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["user", "group"];

function init(service, localConfig, cb) {

    let fillModels = (blName, cb) => {
        let typeModel = __dirname + `/../model/${model}/${blName}.js`;

        if (fs.existsSync(typeModel)) {
            SSOT[`${blName}Model`] = require(typeModel);
        }
        if (SSOT[`${blName}Model`]) {
            let temp = require(`./${blName}.js`);
            temp.model = SSOT[`${blName}Model`];
            temp.soajs_service = service;
            temp.localConfig = localConfig;
            BL[blName] = temp;
            return cb(null);
        } else {
            return cb({name: blName, model: typeModel});
        }
    };
    async.each(BLs, fillModels, function (err, result) {
        if (err) {
            service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
            return cb({"code": 601, "msg": localConfig.errors[601]});
        }
        return cb(null);
    });
}

let BL = {
    init: init,
    group: null,
    user: null,

    deleteGroup : (soajs, inputmaskData, cb) =>{
        BL.group.deleteGroup (soajs, inputmaskData, (error, record)=>{
            if (error){
                return cb (error);
            }
            else{
                //close response but continue to clean up delete group from users
                cb (null, true);
                let data = {};
                if (record && record.tenant) {
                    data.tId = record.tenant.id;
                    data.groupCode = record.code;
                    BL.user.cleanDeletedGroup(soajs, data, (error) => {
                        if (error) {
                            soajs.log.error(err);
                        }
                    });
                }
            }
        });
    }
};

module.exports = BL;