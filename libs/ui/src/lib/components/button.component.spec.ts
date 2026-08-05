import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;

  beforeEach(() => {
    component = new ButtonComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit btnClick event on click when enabled', () => {
    jest.spyOn(component.btnClick, 'emit');
    component.onClick(new MouseEvent('click'));
    expect(component.btnClick.emit).toHaveBeenCalled();
  });

  it('should not emit btnClick event when disabled', () => {
    jest.spyOn(component.btnClick, 'emit');
    component.disabled = true;
    component.onClick(new MouseEvent('click'));
    expect(component.btnClick.emit).not.toHaveBeenCalled();
  });
});
