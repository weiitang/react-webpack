/* eslint-disable no-console */
import { useModuleNavigator, useRouteNavigate } from '@core';

export default function () {
  const navigators = useModuleNavigator();
  const navigate = useRouteNavigate();
  console.log('navigators2', navigators);

  const handleClickDiv = () => {
    console.log('navigatorsClick', navigators);
    navigate('navigator-params/123456');
  };

  return (
    <div>
      <div onClick={handleClickDiv}>Params</div>
      <div>Test Router</div>
    </div>
  );
}
