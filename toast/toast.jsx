import React, { createContext, useEffect, useRef, useState } from 'react';

import { __, getRandomString } from '../helpers.jsx';
import style from './toast.module.scss';
import { Ripple } from '../dynamic-svg/ripple.jsx';
import {Conditional} from '../conditional.jsx';

import icon_success from '../static/images/Icon-check.svg';
import icon_warning from '../static/images/Icon-info-circle.svg';
import icon_error from '../static/images/Icon-cross.svg';

export const ContextToast = createContext();

const status_icons = {
    success: icon_success,
    warning: icon_warning,
    error: icon_error
};

export function ToastWrapper({children}) {
    const ref = useRef();

    const [state, setState] = useState({
        mouse_over: false,
        toasts: []
    });

    const registerCloser = (id) => {
        setTimeout(() => {
            if (!state.mouse_over) {
                dismissToast(id);
            } else {
                registerCloser(id);
            }
        }, 5000);
    };

    const addToast = (toast) => {
        const new_id = getRandomString();
        const { toasts = [] } = state;

        if (typeof toast === 'string') {
            toast = {
                message: toast,
                dismissible: true
            };
        }

        // Push new toast in the array
        toasts.push({
            ...toast,
            id: new_id
        });

        // Update state with the toasts
        setState({
            ...state,
            toasts
        });

        // Register closer to close it after certain times
        registerCloser(new_id);
    };

    const ajaxToast = (response) => {
        const { success, data } = typeof response === 'object' ? response || {} : {};
        const { message, status } = data || {};

        addToast({
            message: message ? message : (success ? __('Done') : __('Something went wrong!')),
            dismissible: true,
            status: status || (success ? 'success' : 'error')
        });
    };

    const dismissToast = (id) => {
        const { toasts = [] } = state;
        const index = toasts.findIndex((t) => t.id === id);
        toasts.splice(index, 1);
        setState({
            ...state,
            toasts
        });
    };

    const setMouseState = (over) => {
        setState({
            ...state,
            mouse_over: over
        });
    };

    // Scroll to last to show latest one
    useEffect(() => {
        if (!state.toasts.length || !ref?.current) {
            return;
        }
        ref.current.scrollTop = ref.current.scrollHeight;
    }, [state.toasts.length]);

    return (
        <ContextToast.Provider value={{ addToast, ajaxToast }}>
            {children}

            {(state.toasts.length && (
                <div
                    data-crew="toast-wrapper"
                    ref={ref}
                    className={
                        'toast'.classNames(style) + 'position-fixed right-50 bottom-33'.classNames()
                    }
                    onMouseOver={() => setMouseState(true)}
                    onMouseOut={() => setMouseState(false)}
                >
                    {state.toasts.map((toast) => {
                        const { id, message, dismissible, onTryAgain, status = 'success' } = toast;

                        return (
                            <div
                                data-crew="toast-single"
                                key={id}
                                className={'d-flex align-items-center border-radius-5'.classNames()}
                            >
                                <div
                                    data-crew="content"
                                    className={'flex-1 d-flex align-items-center row-gap-10 padding-15'.classNames()}
                                >
                                    <div
                                        data-crew="ripple"
                                        className={'d-inline-block'.classNames()}
                                    >
										{
											(!status || !status_icons[status]) ? 
												<Ripple color={window[window.CrewPointer || 'CrewHRM'].colors['secondary']} /> : 
												<img className={'width-36 height-auto'.classNames()} src={status_icons[status]}/>
										}
                                    </div>

                                    <span
                                        data-crew="message"
                                        className={'d-inline-block margin-left-10 font-size-15 font-weight-500 line-height-18 color-white'.classNames()}
                                    >
                                        {message}
                                    </span>
                                </div>

								<Conditional show={dismissible || onTryAgain}>
									<div
                                        data-crew="control"
                                        className={'d-flex flex-direction-column border-left-1'.classNames()}
                                    >
										<Conditional show={onTryAgain}>
											<div
                                                data-crew="try"
                                                className={`padding-vertical-10 padding-horizontal-20 ${
                                                    dismissible ? 'border-bottom-1' : ''
                                                }`.classNames()}
                                            >
                                                <span
                                                    className={'font-size-13 font-weight-500 line-height-22 color-white cursor-pointer'.classNames()}
                                                    onClick={() => {
                                                        dismissToast(id);
                                                        onTryAgain();
                                                    }}
                                                >
                                                    {__('Try Again')}
                                                </span>
                                            </div>
										</Conditional>
										
										<Conditional show={dismissible}>
											<div
                                                data-crew="dismiss"
                                                className={'padding-vertical-10 padding-horizontal-20'.classNames()}
                                            >
                                                <span
                                                    className={'font-size-13 font-weight-500 line-height-22 color-white cursor-pointer'.classNames()}
                                                    onClick={() => dismissToast(id)}
                                                >
                                                    {__('Dismiss')}
                                                </span>
                                            </div>
										</Conditional>
                                    </div>
								</Conditional>
                            </div>
                        );
                    })}
                </div>
            )) ||
                null}
        </ContextToast.Provider>
    );
}
