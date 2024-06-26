/* eslint-disable no-console */
import { FormModel } from '@src/components/hook-form';
import { Model } from '@src/components/hook-form/form-model';

const $i18next = {
  t: (str) => str,
};

const validateNotCreator = (value, formValues) => {
  const creatorId =
    formValues?.creator?.userId || formValues.helpers.creator?.userId;
  let isValidate = false;
  if (Array.isArray(value)) {
    isValidate = !value.some((user) => user.userId === creatorId);
  } else {
    isValidate = value.userId !== creatorId;
  }
  return isValidate || '创建人不可以担任审批人员';
};

// 不同阶段可渲染的不一样
export const getEditable = (
  status?: string,
  formKey?: string,
  whiteProperties?: string[]
): boolean => {
  // 运营审批阶段都可编辑
  if (!status) return true;
  return whiteProperties?.includes(formKey);
};

export const showField = (formValues, formKey, whiteProperties = null) => {
  const { signOffStatus, isRoot, whiteProperties: whiteKey } = formValues;

  if (isRoot) return true;
  return getEditable(signOffStatus, formKey, whiteProperties || whiteKey);
};

export function toJSONEnhance() {
  const rawData = this.getValues();
  console.log('rrrr', rawData);
  const { model } = this;

  const result = {};
  const handleMeta = (args: {
    index?: number;
    meta: Record<string, any>;
    value: any;
    key: string;
    itemResult: Record<string, any>;
    rawValues: Record<string, any>;
  }) => {
    const { meta, rawValues, value, index, key, itemResult } = args;
    const { shouldRender } = meta;
    const { map, drop } = meta.metaProps || {};
    // @drop
    if (typeof drop !== 'undefined') {
      if (typeof drop === 'function') {
        if (drop(value)) return;
      } else if (drop) {
        return;
      }
    } else if (typeof shouldRender !== 'undefined') {
      const shouldRenderValue =
        typeof index === 'undefined'
          ? shouldRender(rawValues)
          : shouldRender(rawValues, { index });
      if (!shouldRenderValue) return;
    }

    // @map
    if (typeof map !== 'undefined') {
      itemResult[key] = map(value);
      return;
    }

    itemResult[key] = value;
  };

  Object.entries(rawData).forEach(([key, value]) => {
    const meta = model[key];
    if (!meta) return;
    const { fieldConfig } = meta;
    // 目前只能通过这种hack的方式来判断 子表单的情况
    if (Array.isArray(value) && fieldConfig) {
      value.forEach((subFormRow, valueIndex) => {
        const r = {};
        Object.entries(subFormRow).forEach(([subFormKey, subFormValue]) => {
          // 表单处理过的 model
          let meta = model[`${key}.${valueIndex}.${subFormKey}`];
          // 如果没有model的话，就用原始的fieldConfig，可能会有未知问题
          if (!meta) meta = fieldConfig[subFormKey];

          if (!meta) return;
          handleMeta({
            itemResult: r,
            meta,
            value: subFormValue,
            key: subFormKey,
            index: valueIndex,
            rawValues: rawData,
          });
        });
        if (!result[key]) result[key] = [];
        result[key].push(r);
      });
    } else {
      handleMeta({
        itemResult: result,
        meta,
        value,
        key,
        index: undefined,
        rawValues: rawData,
      });
    }
  });

  return result;
}

const optionMap = (value) => {
  if (Array.isArray(value)) return value.map((item) => item.id);
  return value?.id ?? '';
};

export const formConfig: Model = {
  // 辅助数据与字段
  helpers: {
    defaultValue: {
      creator: {},
    },
  },
  team: {
    defaultValue: '',
    rules: {
      required: $i18next.t('tpp-signoff:e1b24da0:请选择基金团队'),
    },
    metaProps: {
      map: optionMap,
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:e1b24da0:请选择基金团队'),
    },
  },
  signType: {
    defaultValue: [],
    rules: {
      required: $i18next.t('tpp-signoff:fecd8f22:请选择签署类型'),
    },
    metaProps: {
      map: optionMap,
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:fecd8f22:请选择签署类型'),
    },
  },
  approvalType: {
    defaultValue: '',
    metaProps: {
      map: optionMap,
    },
    rules: {
      required: $i18next.t('tpp-signoff:aa8a1f80:请选择审批类型'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:aa8a1f80:请选择审批类型'),
    },
  },
  documentTypes: {
    defaultValue: [],
    metaProps: {
      map: optionMap,
    },
    rules: {
      required: $i18next.t('tpp-signoff:30f7b59e:请选择文档类型'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:30f7b59e:请选择文档类型'),
    },
  },
  fileName: {
    defaultValue: '',
    rules: {
      required: $i18next.t('tpp-signoff:7aa81d15:请输入文件名称'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:7aa81d15:请输入文件名称'),
    },
  },
  investorCorporations: {
    defaultValue: [{ corporationId: '', businessGroup: '', sealType: [] }],
    rules: {
      required: $i18next.t('tpp-signoff:ad54e83e:请添加我方主体信息'),
    },
    fieldConfig: {
      corporationId: {
        metaProps: {
          map: optionMap,
        },
        rules: {
          required: $i18next.t('tpp-signoff:09c4b505:请输入我方主体法定名称'),
        },
        renderProps: {
          placeholder: $i18next.t(
            'tpp-signoff:09c4b505:请输入我方主体法定名称'
          ),
        },
      },
      businessGroup: {
        metaProps: {
          map: optionMap,
        },
        rules: {
          required: $i18next.t('tpp-signoff:19a825c9:请选择我方主体业务组'),
        },
        renderProps: {
          placeholder: $i18next.t('tpp-signoff:b2a4868a:请选择业务组'),
        },
      },
      sealType: {
        defaultValue: [],
        metaProps: {
          map: optionMap,
        },
        rules: {
          required: $i18next.t('tpp-signoff:196afe49:请选择我方主体用章类型'),
        },
        renderProps: {
          placeholder: $i18next.t('tpp-signoff:071cebf9:请选择用章类型'),
        },
      },
    },
  },
  investeeCorporations: {
    defaultValue: [{ corporationName: '', vendorGroup: '', shortName: '' }],
    rules: {
      required: $i18next.t('tpp-signoff:d21ed4fd:请添加对方主体信息'),
    },
    fieldConfig: {
      corporationName: {
        rules: {
          required: $i18next.t('tpp-signoff:c202dc36:请输入对方主体法定名称'),
        },
        renderProps: {
          placeholder: $i18next.t(
            'tpp-signoff:c202dc36:请输入对方主体法定名称'
          ),
        },
      },
      vendorGroup: {
        metaProps: {
          map: optionMap,
        },
        rules: {
          required: $i18next.t('tpp-signoff:744ad12b:请选择对方主体类型'),
        },
        renderProps: {
          placeholder: $i18next.t('tpp-signoff:744ad12b:请选择对方主体类型'),
        },
      },
      shortName: {
        renderProps: {
          placeholder: $i18next.t('tpp-signoff:9962dfcd:请输入对方主体简称'),
        },
      },
    },
  },
  orgTimIds: {
    defaultValue: '',
    shouldRender: (formValues) =>
      formValues.documentTypes.some((item) => [].includes(item.id)),
    rules: {
      required: $i18next.t('tpp-signoff:45ba7080:请选择公司名称'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:96e6a25c:请输入公司名称'),
    },
    metaProps: {
      drop: () => false,
    },
  },
  intro: {
    defaultValue: '',
    rules: {
      validate: (value, formValues) => {
        if (value || formValues.introDirectoryId) return true;
        return $i18next.t(
          'tpp-signoff:5f2b4b28:签署说明和签署说明附件至少填写一项'
        );
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:4b39e3ae:请输入签署说明'),
    },
  },
  introDirectoryId: {
    rules: {
      validate: async (value, formValues) => {
        if (formValues.intro) return true;
        if (!value)
          return $i18next.t(
            'tpp-signoff:5f2b4b28:签署说明和签署说明附件至少填写一项'
          );

        if (value) {
          const res = await new Promise((req) => req(true));
          return res
            ? true
            : $i18next.t(
                'tpp-signoff:5f2b4b28:签署说明和签署说明附件至少填写一项'
              );
        }
      },
    },
  },
  isLegalNeeded: {
    metaProps: {
      map: optionMap,
    },
    defaultValue: '',
    rules: {
      required: $i18next.t('tpp-signoff:bb81cb35:请选择是否需要法务审查'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:bb81cb35:请选择是否需要法务审查'),
    },
  },
  legalPreApprovalDirectoryId: {
    shouldRender: (formValues) =>
      formValues.approvalType?.id === '' && formValues.isLegalNeeded?.id === '',
    rules: {
      required: $i18next.t('tpp-signoff:8b95c07b:请上传法务预审批文件'),
      validate: async (value) => {
        if (!value)
          return $i18next.t('tpp-signoff:8b95c07b:请上传法务预审批文件');

        const res = await new Promise((req) => req(true));
        return res
          ? true
          : $i18next.t('tpp-signoff:8b95c07b:请上传法务预审批文件');
      },
    },
  },
  legalApprovalDirectoryId: {
    shouldRender: (formValues) =>
      formValues.approvalType?.id === '' && formValues.isLegalNeeded?.id === '',
    rules: {
      required: $i18next.t('tpp-signoff:aa114340:请上传法务审批文件'),
      validate: async (value) => {
        if (!value)
          return $i18next.t('tpp-signoff:aa114340:请上传法务审批文件');

        const res = await new Promise((req) => req(true));
        return res
          ? true
          : $i18next.t('tpp-signoff:aa114340:请上传法务审批文件');
      },
    },
  },
  withoutLegalReason: {
    defaultValue: '',
    shouldRender: (formValues) => formValues.isLegalNeeded?.id === '',
    rules: {
      required: $i18next.t('tpp-signoff:df2c5d7b:请提供无需法务审批的原因'),
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:df2c5d7b:请提供无需法务审批的原因'),
    },
  },
  relatedSignIds: {
    metaProps: {
      map: (value) => value?.map((item) => item.id) ?? [],
    },
    defaultValue: [],
    renderProps: {
      placeholder: $i18next.t(
        'tpp-signoff:1e8cb9b9:请输入关键词搜索TPP关联签署单'
      ),
    },
  },
  deadline: {
    defaultValue: '',
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:a8edbf0d:请选择签字截止日期'),
    },
  },
  tentativeSignDocsDirectoryId: {
    shouldRender: (formValues) => formValues.approvalType?.id === '',
    rules: {
      required: $i18next.t('tpp-signoff:8351f6e0:请上传暂定签署文件'),
      validate: async (value) => {
        if (!value)
          return $i18next.t('tpp-signoff:8351f6e0:请上传暂定签署文件');

        const res = await new Promise((req) => req(true));
        return res
          ? true
          : $i18next.t('tpp-signoff:8351f6e0:请上传暂定签署文件');
      },
    },
  },
  toSignDocsDirectoryId: {
    shouldRender: (formValues) => formValues.approvalType?.id === '',
    rules: {
      required: $i18next.t('tpp-signoff:b18c6690:请上传待签署文件'),
      validate: async (value) => {
        if (!value) return $i18next.t('tpp-signoff:b18c6690:请上传待签署文件');

        const res = await new Promise((req) => req(true));
        return res ? true : $i18next.t('tpp-signoff:b18c6690:请上传待签署文件');
      },
    },
  },
  toSignPagesDirectoryId: {
    shouldRender: (formValues) => formValues.approvalType?.id === '',
  },
  // 新建和运营确认的时候不展示
  tppSignedPagesDirectoryId: {
    shouldRender: (formValues) =>
      showField(formValues, 'tppSignedPagesDirectoryId'),
  },
  // 新建和运营确认的时候不展示
  finalDocsDirectoryId: {
    shouldRender: (formValues) => showField(formValues, 'finalDocsDirectoryId'),
  },
  operators: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    shouldRender: (formValues) =>
      isCNYTeam(formValues.team) || isUSDTeam(formValues.team),
    rules: {
      required: $i18next.t('tpp-signoff:c6f3947a:请选择TPP运营人员'),
      validate: {
        duplicate: () => true,
      },
    },
  },
  mcdOperators: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    shouldRender: (formValues) => isMCDTeam(formValues.team),
    rules: {
      required: $i18next.t('tpp-signoff:bd00ef45:请选择MCD运营人员'),
      validate: {
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:bd00ef45:请选择MCD运营人员'),
    },
  },
  operatorOwners: {
    metaProps: {
      map: () => true,
    },
    rules: {
      required: $i18next.t('tpp-signoff:7482d950:请选择TPP运营负责人'),
      validate: {
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:7482d950:请选择TPP运营负责人'),
    },
  },
  businessOwners: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    shouldRender: (formValues) =>
      isUSDTeam(formValues.team) || isCNYTeam(formValues.team),
    rules: {
      // required: $i18next.t('tpp-signoff:d3054a2b:请选择TPP业务负责人'),
      required: false,
      validate: {
        onlyOne: (value) => {
          if (value.length > 1)
            return $i18next.t('tpp-signoff:e94d3ecf:TPP业务负责人只能选择一个');
          return true;
        },
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:d3054a2b:请选择TPP业务负责人'),
    },
  },
  mcdOwners: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    shouldRender: (formValues) => isMCDTeam(formValues.team),
    rules: {
      required: $i18next.t('tpp-signoff:a2516ce3:请选择MCD负责人'),
      validate: {
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:a2516ce3:请选择MCD负责人'),
    },
  },
  finances: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    rules: {
      required: $i18next.t('tpp-signoff:8dbf9201:请选择TPP财务'),
      validate: {
        validateNotCreator,
        finances: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:8dbf9201:请选择TPP财务'),
    },
  },
  seniorFinances: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    shouldRender: (formValues) => isUSDTeam(formValues.team),
    rules: {
      required: $i18next.t('tpp-signoff:8863fba7:请选择TPP高级财务'),
      validate: {
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:8863fba7:请选择TPP高级财务'),
    },
  },
  legals: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    rules: {
      required: $i18next.t('tpp-signoff:f55039bf:请选择TPP法务'),
      validate: {
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:f55039bf:请选择TPP法务'),
    },
  },
  oc: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    rules: {
      required: $i18next.t('tpp-signoff:aa930ad0:请选择OC'),
      validate: {
        validateNotCreator,
        duplicate: () => true,
      },
    },
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:aa930ad0:请选择OC'),
    },
  },
  relevantMembers: {
    metaProps: {
      map: () => true,
    },
    defaultValue: [],
    renderProps: {
      placeholder: $i18next.t('tpp-signoff:8a55e463:请选择相关成员'),
    },
  },
};

export class TppSignoffFormModel extends FormModel {
  toJSON(): Record<string, any> {
    return toJSONEnhance.apply(this);
  }
}

export const createFormModel = () => new TppSignoffFormModel(formConfig);

function isMCDTeam(team) {
  return team?.id === '';
}

function isUSDTeam(team) {
  return team?.id === '';
}

function isCNYTeam(team) {
  return team?.id === '';
}
