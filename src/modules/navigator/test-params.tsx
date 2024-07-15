/* eslint-disable no-console */
import { useModuleNavigator, useModuleParams } from '@core';

export default function () {
  const navigators = useModuleNavigator();
  const { id } = useModuleParams();

  console.log('navigators3', navigators, id);

  return <div>Test Params</div>;
}
