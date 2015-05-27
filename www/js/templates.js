angular.module("zaptv").run(["$templateCache", function($templateCache) {$templateCache.put("templates/channel.html","<ion-view class=\"chat-view\">\n    <ion-nav-title>\n        {{schedule.name || \"Carregando..\"}}\n    </ion-nav-title>\n    <ion-nav-buttons side=\"right\">\n        <button class=\"button button-clear ion-information-circled\" ng-click=\"openPopover($event)\"> Info</button>\n    </ion-nav-buttons>\n    <ion-content delegate-handle=\"chat-scroll\">\n        <ion-refresher pulling-text=\"Carregando mais mensagens..\" on-refresh=\"loadBefore()\"></ion-refresher>\n        <ion-spinner icon=\"spiral\" ng-if=\"isLoadingChat\" class=\"centered is-loading-chat\"></ion-spinner>\n        <message ng-repeat=\'message in messages track by (message.id + \"_\" + message.created_at.toISOString())\' data=\'message\'></message>\n        <div class=\"clearfix\"></div>\n    </ion-content>\n\n    <ion-footer-bar class=\"bar-stable item-input-inset message-footer\" keyboard-attach>\n        <label class=\"item-input-wrapper\">\n            <textarea placeholder=\"Digite sua mensagem...\" ng-model=\"currentMessage\" minlength=\"1\" maxlength=\"1500\" msd-elastic></textarea>\n        </label>\n        <div class=\"footer-btn-wrap\">\n            <button class=\"button button-icon icon ion-android-send footer-btn\" type=\"submit\" ng-click=\"submitMessage(currentMessage)\" ng-class=\"{\n            disabled: !currentMessage || currentMessage.trim().length == 0\n        }\">\n            </button>\n        </div>\n    </ion-footer-bar>\n</ion-view>\n\n<script id=\"channel_popover\" type=\"text/ng-template\">\n    <ion-popover-view class=\"channel-popover\">\n        <ion-header-bar>\n            <h2 class=\"title\">{{::channel.name}}</h2>\n            <button class=\"button button-clear button-icon ion-ios-close-empty\" ng-click=\'closePopover()\'></button>\n        </ion-header-bar>\n        <ion-content overflow-scroll=\"true\">\n            <ion-list>\n                <ion-item class=\"item-btn-schedule text-center\">\n                    <p class=\"text-center\" ng-click=\"viewSchedule()\">\n                        Ver progamação completa\n                    </p>\n                </ion-item>\n                <ion-item>\n                    <p class=\"popover-info\">Avalie {{schedule.name}}:</p>\n                    <score ng-model=\"currentScore\"></score>\n                </ion-item>\n                <div class=\"wrapper-next-schedule\" ng-class=\'{\n                    \"is-loading\": isLoadingNextSchedule,\n                    \"error-loading\": nextScheduleError\n                }\'>\n                    <ion-spinner></ion-spinner>\n                    <button ng-click=\'loadNextSchedule()\' id=\"refresh-button\" class=\"button button-clear icon ion-ios-refresh-empty\"></button>\n                    <ion-item class=\"item-divider\">\n                        <p class=\"popover-info\">\n                            <i class=\"icon ion-ios-time-outline\"></i> Em {{minutesRemain | timeramain}} começa:\n                        </p>\n                    </ion-item>\n                    <ion-item>\n                        <img src=\"img/placeholder.jpg\" class=\"next-schedule-image\" ng-src=\"{{nextSchedule.image_url}}\" width=\"200\">\n                        <h2 class=\"next-schedule-name\">{{nextSchedule.name}}</h2>\n                        <p ng-show=\'nextSchedule.name != nextSchedule.description\' class=\"next-schedule-description\">{{nextSchedule.description}}</p>\n                    </ion-item>\n                </div>\n\n            </ion-list>\n        </ion-content>\n    </ion-popover-view>\n</script>\n");
$templateCache.put("templates/channels.html","<ion-view hide-back-button=\"true\" class=\"channels-view\" view-title=\"Conversas disponíveis\" enable-menu-with-back-views=\"false\">\n    <ion-nav-buttons side=\"right\">\n        <button class=\"button button-clear\" ng-click=\"openPopover($event)\" ng-cloak>\n            <i class=\"icon ion-android-more-horizontal\"></i>\n        </button>\n    </ion-nav-buttons>\n    <ion-tabs class=\"tabs-striped tabs-color-assertive fade-in-not-out\">\n        <ion-tab title=\"TV Aberta\">\n\n            <ion-view on-swipe-left=\"goToTab(1)\">\n\n                <ion-spinner icon=\"spiral\" ng-if=\"isLoading\" class=\"centered\"></ion-spinner>\n                <ion-content on-scroll=\"forceRepaint()\">\n                    <ion-refresher pulling-text=\"Atualizando conversas...\" on-refresh=\"refresh()\"></ion-refresher>\n                    <div class=\"padding channels-list\">\n                        <channel-tile ng-repeat=\"channel in openChannels track by channel.id\" item-width=\"50%\"></channel-tile>\n                    </div>\n                </ion-content>\n            </ion-view>\n        </ion-tab>\n        <ion-tab title=\"TV por assinatura\">\n            <ion-view on-swipe-right=\"goToTab(0)\">\n                <ion-spinner icon=\"spiral\" ng-if=\"isLoading\" class=\"centered\"></ion-spinner>\n                <ion-content on-scroll=\"forceRepaint()\">\n                    <ion-refresher pulling-text=\"Carregando programação...\" on-refresh=\"refresh()\"></ion-refresher>\n                    <div class=\"padding channels-list\">\n                        <channel-tile ng-repeat=\"channel in privateChannels track by channel.id\" item-width=\"50%\"></channel-tile>\n                    </div>\n                </ion-content>\n            </ion-view>\n        </ion-tab>\n    </ion-tabs>\n    <div class=\"rate-app-bar\" animation-handle=\"rating-box\">\n        <button ng-click=\"hideRateBar()\" class=\"button button-clear button-icon ion-ios-close-empty close-rate-bar\"></button>\n        <div class=\"container-title-rate\">\n            <h4 class=\"title-rate text-center\">Que tal avaliar o <strong>zaper</strong> na App Store?</h4>\n        </div>\n        <div class=\"text-center\">\n            <button class=\"button button-no\" ng-click=\'noThanks()\'>Não, obrigado.</button>\n            <button class=\"button button-yes\" ng-click=\'rateApp()\'>Sim, com certeza!</button>\n        </div>\n    </div>\n</ion-view>\n\n<script id=\"channels_popover\" type=\"text/ng-template\">\n    <ion-popover-view>\n        <ion-header-bar>\n            <h1 class=\"title\">Menu</h1>\n            <button class=\"button button-clear button-icon ion-ios-close-empty\" ng-click=\'closePopover()\'></button>\n        </ion-header-bar>\n        <ion-content overflow-scroll=\"true\">\n            <ion-list>\n                <ion-item class=\"item-icon-left\" ng-click=\"goToProfile()\">\n                    <i class=\"icon ion-person\"></i> Meu Perfil\n                </ion-item>\n                <ion-item class=\"item-icon-left\" ng-click=\"refresh()\">\n                    <i class=\"icon ion-refresh\"></i> Atualizar\n                </ion-item>\n                <ion-item class=\"item-icon-left\" ng-click=\"rateApp()\">\n                    <i class=\"icon ion-android-favorite salmon\"></i> Avaliar app!\n                </ion-item>\n                <ion-item class=\"item-icon-left\" ng-click=\"shareApp()\">\n                    <i class=\"icon ion-android-share-alt facebook\"></i> Compartilhar app\n                </ion-item>\n                <ion-item class=\"item-icon-left\" ng-click=\"logout()\">\n                    <i class=\"icon ion-log-out\"></i> Sair\n                </ion-item>\n            </ion-list>\n        </ion-content>\n    </ion-popover-view>\n</script>\n");
$templateCache.put("templates/full_schedule_modal.html","<ion-modal-view class=\"full-schedule-view\">\n    <ion-header-bar class=\"bar-salmon\">\n        <button class=\"button button-clear button-icon ion-ios-close-empty\" ng-click=\'closeScheduleModal()\'></button>\n        <div class=\"title header-item\" >\n            <span class=\"nav-bar-title\">\n                <img ng-src=\"{{::channel.image_url}}\" width=\"20\" handle-load-error class=\"channel-logo\" alt=\"logo da emissora\">\n                <h2 class=\"channel-name\">\n                    {{::channel.name}}\n                </h2>\n            </span>\n        </div>\n    </ion-header-bar>\n    <ion-content overflow-scroll=\"true\">\n        <ion-list>\n            <ion-item class=\"schedule-item\" ng-repeat=\"schedule in fullSchedule track by schedule.id\" >\n                <div class=\"channel-image\" style=\"background-image: url({{::schedule.image_url || \'img/placeholder.jpg\'}});\" ></div>\n                <h2>{{::schedule.name}}</h2>\n                <p class=\"schedule-date\">{{::schedule.start_time | date:\'dd/MM/yyyy HH:mm\'}}</p>\n                <button class=\"icon-left\" ng-click=\"toggleFavorite(schedule)\" ng-class=\"{\n                                                    \'ion-ios-star-outline\': !schedule.is_favorite,\n                                                    \'favorite-button\': !schedule.is_favorite,\n                                                    \'favorited-button\': schedule.is_favorite,\n                                                    \'ion-ios-star\': schedule.is_favorite\n                                                }\"> {{schedule.is_favorite ? \'Salvo\' : \'Salvar nos favoritos\'}}</button>\n                <label expand-item for=\"{{::schedule.name}}-{{$index}}\" ng-if=\"schedule.description.length > 0 && schedule.name != schedule.description\">\n                    <i class=\"icon ion-ios-arrow-down see-more-button\"></i>\n                    <input type=\"checkbox\" name=\"{{::schedule.name}}-{{$index}}\" id=\"{{::schedule.name}}\" class=\"description-toggle-input\" autocomplete=\"off\"/>\n                    <p class=\"program-description\">{{::schedule.description}}</p>\n\n                </label>\n            </ion-item>\n        </ion-list>\n    </ion-content>\n</ion-modal-view>\n");
$templateCache.put("templates/login-form.html","<ion-view class=\"login-view\" title=\"Login\" >\n    <ion-content>\n        <h1 class=\"text-center main-logo\">\n            <img src=\"img/logo.png\" alt=\"logo zaper\" width=\"180\">\n        </h1>\n        <div class=\"padding form-login\">\n            <form ng-submit=\"localLogin(ll)\" class=\"list list-inset med-quick-anim\" animation-handle=\"login-form\" novalidate>\n                <label class=\"item item-input bg-transparent\">\n                    <i class=\"icon ion-ios-person-outline placeholder-icon\"></i>\n                    <input type=\"text\" placeholder=\"Email ou Usuário\" ng-model=\"ll.login_key\">\n                </label>\n                <label class=\"item item-input bradius-bottom bg-transparent\">\n                    <i class=\"icon ion-ios-locked-outline placeholder-icon\"></i>\n                    <input type=\"password\" placeholder=\"Senha\" ng-model=\"ll.password\">\n                </label>\n                <button class=\"button button-block button-salmon button-login\">\n                    Entrar\n                </button>\n            </form>\n        </div>\n    </ion-content>\n</ion-view>\n");
$templateCache.put("templates/login.html","<ion-view hide-nav-bar=\"true\" hide-back-button=\"true\" class=\"login-view\">\n    <ion-content>\n        <h1 class=\"text-center main-logo\">\n            <img src=\"img/logo.png\" alt=\"logo zaper\" width=\"180\">\n        </h1>\n        <div class=\"text-center padding\">\n            <p class=\"call-text\">No zaper, você conversa com seus amigos sobre seus programas favoritos!</p>\n        </div>\n        <div class=\"list padding\">\n            <a class=\"item item-icon-left item-icon-right button-facebook\" ng-click=\'facebookLogin()\'>\n                <i class=\"icon ion-social-facebook \"></i> Entrar com o Facebook\n                <i class=\"icon ion-ios-arrow-right\"></i>\n            </a>\n            <a class=\"item item-icon-left item-icon-right list-button-salmon\" href=\"#/login-form\">\n                <i class=\"icon ion-ios-home\"></i> Já possui cadastro? Entre aqui!\n                <i class=\"icon ion-ios-arrow-right\"></i>\n            </a>\n        </div>\n    </ion-content>\n    <div class=\"bar bar-footer\">\n        <a class=\"item register-button\" href=\"#/register\">\n            Primeira vez? Cadastre <span class=\"underline\">aqui!</span>\n        </a>\n    </div>\n</ion-view>\n");
$templateCache.put("templates/profile.html","<ion-view view-title=\"Meu Perfil\" class=\"profile-view\">\n    <ion-content class=\"has-header\">\n        <div class=\"top-container\">\n            <div class=\"img-container\" ng-click=\'changeImage()\'>\n                <img handle-load-error src=\"img/placeholder.jpg\" ng-src=\"{{user.image_url}}\" alt=\"\" class=\"full-image profile-image\">\n            </div>\n            <div class=\"text-center\">\n                <h4 class=\"username\">{{user.username}}</h4>\n            </div>\n        </div>\n        <div class=\"bottom-container\">\n            <div class=\"list\">\n                <div class=\"item item-divider\">\n                    Dados do usuário\n                </div>\n                <label class=\"item item-input\">\n                    <i class=\"icon ion-ios-person-outline placeholder-icon\"></i>\n                    <input type=\"text\" ng-model=\"user.name\" placeholder=\"Digite o seu nome\">\n                </label>\n                <label class=\"item item-input\" ng-click=\'pickDate()\'>\n                    <i class=\"icon ion-ios-calendar-outline placeholder-icon\"></i>\n                    <p>{{(user.birthdate | date:\'dd/MM/yyyy\') || \"Clique para mudar\"}}</p>\n                </label>\n                <label class=\"item item-input item-select\">\n                    <i class=\"icon ion-ios-people-outline placeholder-icon\"></i>\n                    <select ng-model=\'user.gender\' ng-options=\'gender.id as gender.label for gender in genders\'></select>\n                </label>\n                <div class=\"item item-divider\">\n                    Configurações\n                </div>\n                <label class=\"item item-toggle\">\n                    Compartilhar com Facebook\n                    <label class=\"toggle toggle-assertive\">\n                        <input type=\"checkbox\" ng-model=\'data.facebookShareEnable\'>\n                        <div class=\"track\">\n                            <div class=\"handle\"></div>\n                        </div>\n                    </label>\n                </label>\n                <label class=\"item item-toggle\">\n                    Receber tweets no chat\n                    <label class=\"toggle toggle-assertive\">\n                        <input type=\"checkbox\">\n                        <div class=\"track\">\n                            <div class=\"handle\"></div>\n                        </div>\n                    </label>\n                </label>\n            </div>\n        </div>\n        <div class=\"padding\">\n            <button class=\"button button-block button-confirm padding\" ng-click=\"update()\">Salvar alterações</button>\n        </div>\n    </ion-content>\n</ion-view>\n");
$templateCache.put("templates/register.html","<ion-view class=\"register-view\" view-title=\"Cadastro\">\n    <ion-content class=\"has-header\">\n        <h1 class=\"text-center\">\n            <img src=\"img/logo.png\" alt=\"\" width=\"150\">\n        </h1>\n\n\n        <div class=\"padding form-login\">\n            <div class=\"text-center\">\n                <p>Ao registrar, você estará aceitando nosso <a href=\"\">Termo de Serviço</a>.</p>\n\n            </div>\n            <form name=\"registerForm\" ng-init=\"setForm(this)\" ng-submit=\"register(user)\" class=\"list list-inset med-quick-anim\" novalidate animation-handle=\"register-form\">\n                <label class=\"item item-input bg-transparent\" ng-class=\"{\n                    \'error\': registerForm.username.$dirty && !registerForm.username.$valid,\n                    \'success\': registerForm.username.$dirty && registerForm.username.$valid\n                }\">\n                    <i class=\"icon ion-ios-person-outline placeholder-icon\"></i>\n                    <input type=\"text\" placeholder=\"Usuário\" name=\"username\" ng-model=\"user.username\" username>\n                </label>\n                <label class=\"item item-input bg-transparent\"ng-class=\"{\n                    \'error\': registerForm.email.$dirty && !registerForm.email.$valid,\n                    \'success\': registerForm.email.$dirty && registerForm.email.$valid\n                }\">\n                    <i class=\"icon ion-ios-email-outline placeholder-icon\"></i>\n                    <input type=\"email\" placeholder=\"Email\" name=\"email\" ng-model=\"user.email\" required>\n                </label>\n                <label class=\"item item-input  bg-transparent\" ng-class=\"{\n                    \'error\': registerForm.password.$dirty && !registerForm.password.$valid,\n                    \'success\': registerForm.password.$dirty && registerForm.password.$valid\n                }\">\n                    <i class=\"icon ion-ios-locked-outline placeholder-icon\"></i>\n                    <input type=\"password\" placeholder=\"Senha\" name=\"password\" ng-model=\"user.password\" required>\n                </label>\n                <label class=\"item item-input bradius-bottom bg-transparent\" ng-class=\"{\n                    \'error\': registerForm.password.$dirty && registerForm.password.$valid && (user.password !== user.confirm_password),\n                    \'success\': registerForm.password.$dirty && registerForm.password.$valid && (user.password === user.confirm_password)\n                }\">\n                    <i class=\"icon ion-ios-locked-outline placeholder-icon\"></i>\n                    <input type=\"password\" placeholder=\"Confirmar senha\" name=\"confirm_password\" ng-model=\"user.confirm_password\" required>\n                </label>\n                <button class=\"button button-block button-salmon button-login\">\n                    Registrar\n                </button>\n            </form>\n        </div>\n    </ion-content>\n</ion-view>\n");
$templateCache.put("templates/set_username_modal.html","<ion-modal-view class=\"username-view\">\n    <ion-header-bar class=\"bar\">\n        <button class=\"button button-clear button-icon ion-ios-close-empty\" ng-click=\'closeModal()\'></button>\n    </ion-header-bar>\n    <ion-content>\n        <h1 class=\"text-center\">\n            <img src=\"img/logo.png\" alt=\"\" width=\"180\">\n        </h1>\n        <div class=\"padding form-login\">\n            <p class=\"text-center\">Seu apelido será sua identidade!</p>\n            <form name=\"usernameForm\" ng-init=\"setForm(this)\" ng-submit=\"setUsername(user)\" class=\"list list-inset med-quick-anim\" novalidate animation-handle=\"username-form\">\n                <label class=\"item item-input bg-transparent bradius-bottom\" ng-class=\"{\n                    \'error\': usernameForm.username.$dirty && !usernameForm.username.$valid,\n                    \'success\': usernameForm.username.$dirty && usernameForm.username.$valid\n                }\">\n                    <i class=\"icon ion-ios-at-outline placeholder-icon\"></i>\n                    <input type=\"text\" placeholder=\"apelido\" name=\"username\" ng-model=\"user.username\" username>\n                </label>\n                <label ng-if=\'!hasEmail\' class=\"item item-input bg-transparent bradius-bottom\" ng-class=\"{\n                    \'error\': usernameForm.email.$dirty && !usernameForm.email.$valid,\n                    \'success\': usernameForm.email.$dirty && usernameForm.email.$valid\n                }\">\n                    <input type=\"email\" placeholder=\"email\" name=\"email\" ng-model=\"user.email\">\n                </label>\n                <button class=\"button button-block button-salmon button-login\">\n                    Continuar\n                </button>\n            </form>\n        </div>\n    </ion-content>\n</ion-modal-view>\n");
$templateCache.put("templates/view_user_modal.html","<ion-modal-view class=\"profile-view\">\n    <ion-header-bar class=\"bar-salmon\">\n        <button class=\"button button-clear button-icon ion-ios-close-empty right-button\" ng-click=\'closeModal()\'></button>\n    </ion-header-bar>\n    <ion-content scroll=\"false\">\n        <div class=\"top-container\">\n            <div class=\"img-container\">\n                <img handle-load-error id=\"current-image\" src=\"img/placeholder.jpg\" ng-src=\"{{userToView.image_url || \'img/placeholder.jpg\'}}\" alt=\"\" class=\"full-image profile-image\">\n            </div>\n            <div class=\"text-center\">\n                <h4 class=\"username\">{{userToView.username}}</h4>\n            </div>\n        </div>\n        <div class=\"bottom-container\" ng-if=\"userToView.name || userToView.birthdate || userToView.gender\">\n            <div class=\"list\">\n                <label class=\"item item-input\" ng-if=\"userToView.name\">\n                    <i class=\"icon ion-ios-person-outline placeholder-icon\"></i>\n                    <p>{{userToView.name}}</p>\n                </label>\n                <label class=\"item item-input\" ng-if=\"userToView.birthdate\">\n                    <i class=\"icon ion-ios-calendar-outline placeholder-icon\"></i>\n                    <p>{{userToView.birthdate | date:\'dd/MM/yyyy\'}}</p>\n                </label>\n                <label class=\"item item-input\" ng-if=\"userToView.gender\">\n                    <i class=\"icon ion-ios-people-outline placeholder-icon\"></i>\n                    <p>{{genders[userToView.gender]}}</p>\n                </label>\n            </div>\n        </div>\n        <div class=\"padding\" ng-if=\"!userToView.name && !userToView.birthdate && !userToView.gender\">\n            <p class=\"text-center\"><strong>{{userToView.username}}</strong> não possui nenhuma informação adicionada em seu perfil.</p>\n        </div>\n    </ion-content>\n</ion-modal-view>\n");
$templateCache.put("templates/directives/channel_tile.html","<div class=\"a-card\" ng-click=\"joinChannel(channel)\">\n    <div class=\"img-box\">\n        <img preload-image=\"{{channel.current_schedule.image_url}}\" class=\"channel-image\">\n    </div>\n    <div class=\"card-info\">\n\n        <h2 class=\"channel-name\"><img preload-image=\"{{::channel.image_url}}\" class=\"channel-logo\" alt=\"logo da emissora\"> {{::channel.name}}</h2>\n\n        <p class=\"channel-info\">{{channel.current_schedule.name}}</p>\n        <p class=\"channel-info\">\n            <ng-pluralize count=\"channelStatus[channel.id] || 0\" when=\"{\n                    \'0\': \'Nenhum participante\',\n                    \'one\': \'1 participante\',\n                    \'other\': \'{} participantes\'\n             }\"></ng-pluralize>\n        </p>\n        <p class=\"rate channel-info\">\n\n            <i class=\"rate-icon\" ng-class=\"{\n                \'ion-ios-star\': channel.current_schedule.current_score >= 1,\n                \'ion-ios-star-half\': (channel.current_schedule.current_score < 1 && channel.current_schedule.current_score > 0),\n                \'ion-ios-star-outline\': channel.current_schedule.current_score == null\n            }\"></i>\n            <i class=\"rate-icon\" ng-class=\"{\n                \'ion-ios-star\': channel.current_schedule.current_score >= 2,\n                \'ion-ios-star-half\': (channel.current_schedule.current_score < 2 && channel.current_schedule.current_score > 1),\n                \'ion-ios-star-outline\': channel.current_schedule.current_score <= 1\n            }\"></i>\n            <i class=\"rate-icon\" ng-class=\"{\n                \'ion-ios-star\': channel.current_schedule.current_score >= 3,\n                \'ion-ios-star-half\': (channel.current_schedule.current_score < 3 && channel.current_schedule.current_score > 2),\n                \'ion-ios-star-outline\': channel.current_schedule.current_score <= 2\n            }\"></i>\n            <i class=\"rate-icon\" ng-class=\"{\n                \'ion-ios-star\': channel.current_schedule.current_score >= 4,\n                \'ion-ios-star-half\': (channel.current_schedule.current_score < 4 && channel.current_schedule.current_score > 3),\n                \'ion-ios-star-outline\': channel.current_schedule.current_score <= 3\n            }\"></i>\n            <i class=\"rate-icon\" ng-class=\"{\n                \'ion-ios-star\': channel.current_schedule.current_score >= 5,\n                \'ion-ios-star-half\': (channel.current_schedule.current_score < 5 && channel.current_schedule.current_score > 4),\n                \'ion-ios-star-outline\': channel.current_schedule.current_score <= 4\n            }\"></i>\n        </p>\n        <button class=\"btn button-salmon\">Entrar no chat</button>\n    </div>\n</div>\n");
$templateCache.put("templates/directives/divider_message.html","<div class=\"item-text-wrap chat-message\">\n    <div class=\"show-divider\">\n        <div class=\"text-center container\">\n            <p>{{message.payload.content}}</p>\n        </div>\n    </div>\n</div>\n");
$templateCache.put("templates/directives/loader.html","<svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"512px\" height=\"512px\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\n    <clipPath id=\"chat-path\">\n        <path d=\"M256,96C149.9,96,64,165.1,64,250.3c0,30.7,11.2,59.3,30.4,83.3c0.9,0.9,2.9,3.8,3.6,4.9c0,0-1-1.6-1.1-1.9c0,0,0,0,0,0l0,0\n            c0,0,0,0,0,0c2.3,3.3,3.6,7.1,3.6,11.2c0,1.4-17.9,58-17.9,58l0,0c-1.3,4.4,2.1,8.9,7.6,10c0.8,0.2,1.6,0.2,2.4,0.2\n            c1.3,0,2.5-0.2,3.7-0.5l1.6-0.6l50.6-22c0.9-0.4,9-3.5,10-3.9c0,0,0.6-0.2,0.6-0.2c0,0-0.1,0-0.6,0.2c3.4-1.2,7.2-1.8,11.2-1.8\n            c3.6,0,7.1,0.5,10.3,1.5c0.1,0,0.2,0,0.2,0.1c0.5,0.2,1,0.3,1.5,0.5c23.1,7.9,48.4,10.3,75.1,10.3c106,0,191-64.1,191-149.3\n            C448,165.1,362,96,256,96L256,96z\" />\n    </clipPath>\n    <g id=\"bars\" style=\"clip-path: url(#chat-path);\">\n        <rect class=\"bar-1\" x=\"40\" y=\"10\" width=\"70\" height=\"500\" />\n        <rect class=\"bar-2\" x=\"110\" y=\"10\" width=\"70\" height=\"500\" />\n        <rect class=\"bar-3\" x=\"180\" y=\"10\" width=\"70\" height=\"500\" />\n        <rect class=\"bar-4\" x=\"250\" y=\"10\" width=\"70\" height=\"500\" />\n        <rect class=\"bar-5\" x=\"320\" y=\"10\" width=\"70\" height=\"500\" />\n        <rect class=\"bar-6\" x=\"390\" y=\"10\" width=\"70\" height=\"500\" />\n    </g>\n    <path id=\"bubble\" d=\"M256,112c97,0,176,62,176,138.3c0,35.9-17.6,69.2-49.5,93.9c-32.8,25.4-77.4,39.3-125.5,39.3c-28.9,0-51-3-69.7-9.3\n              c-0.6-0.2-1.3-0.5-2-0.7c-0.3-0.1-0.6-0.2-0.8-0.2c-4.7-1.4-9.7-2.1-14.7-2.1c-5.6,0-11.1,0.9-16.3,2.6l0,0l-0.3,0.1\n              c-0.6,0.2-8.9,3.3-11,4.3l0,0l-39.6,17.2c13.8-43.9,13.8-44.8,13.8-47.6c0-7.1-2.2-14.1-6.3-20.2c-0.5-0.7-1-1.4-1.6-2.1\n              c-0.7-0.9-1.3-1.7-1.8-2.3c-17.4-21.9-26.6-47.1-26.6-73C80,174,159,112,256,112 M256,96C149.9,96,64,165.1,64,250.3\n              c0,30.7,11.2,59.3,30.4,83.3c0.9,0.9,2.9,3.8,3.6,4.9c0,0-1-1.6-1.1-1.9c0,0,0,0,0,0l0,0c0,0,0,0,0,0c2.3,3.3,3.6,7.1,3.6,11.2\n              c0,1.4-17.9,58-17.9,58l0,0c-1.3,4.4,2.1,8.9,7.6,10c0.8,0.2,1.6,0.2,2.4,0.2c1.3,0,2.5-0.2,3.7-0.5l1.6-0.6l50.6-22\n              c0.9-0.4,9-3.5,10-3.9c0,0,0.6-0.2,0.6-0.2c0,0-0.1,0-0.6,0.2c3.4-1.2,7.2-1.8,11.2-1.8c3.6,0,7.1,0.5,10.3,1.5c0.1,0,0.2,0,0.2,0.1\n              c0.5,0.2,1,0.3,1.5,0.5c23.1,7.9,48.4,10.3,75.1,10.3c106,0,191-64.1,191-149.3C448,165.1,362,96,256,96L256,96z\">\n    </path>\n</svg>\n");
$templateCache.put("templates/directives/score.html","<p class=\"text-center score\">\n    <i class=\"icon\" ng-class=\"{\n        \'ion-ios-star\': currentScore >= 1,\n        \'ion-ios-star-outline\': currentScore < 1,\n    }\" ng-click=\'setScore(1)\'></i>\n    <i class=\"icon\" ng-class=\"{\n        \'ion-ios-star\': currentScore >= 2,\n        \'ion-ios-star-outline\': currentScore < 2,\n    }\" ng-click=\'setScore(2)\'></i>\n    <i class=\"icon\" ng-class=\"{\n        \'ion-ios-star\': currentScore >= 3,\n        \'ion-ios-star-outline\': currentScore < 3,\n    }\" ng-click=\'setScore(3)\'></i>\n    <i class=\"icon\" ng-class=\"{\n        \'ion-ios-star\': currentScore >= 4,\n        \'ion-ios-star-outline\': currentScore < 4,\n    }\" ng-click=\'setScore(4)\'></i>\n    <i class=\"icon\" ng-class=\"{\n        \'ion-ios-star\': currentScore >= 5,\n        \'ion-ios-star-outline\': currentScore < 5,\n    }\" ng-click=\'setScore(5)\'></i>\n</p>\n");
$templateCache.put("templates/directives/twaper_message.html","<div class=\"item-text-wrap chat-message twaper\"  id=\"message-{{message.id}}\">\n    <div class=\"avatar\">\n        <img class=\"profile-image\" src=\"img/placeholder.jpg\" preload-image=\"{{::message.payload.image_url}}\" alt=\"foto perfil do usuario\">\n\n    </div>\n    <div class=\"chat-bubble\">\n        <h2 class=\"c-username\" ng-style=\"{\n            \'color\': getUserColor(message.user.id)\n        }\">\n        <i class=\"icon ion-social-twitter twitter-icon\"></i>\n            <span class=\"username\">{{::message.payload.username}}</span>\n        </h2>\n        <p compile=\"::message.compiled_content\"></p>\n        <!-- <span class=\"timestamp\" >{{::message.created_at | date:\'HH:mm\'}}</span> -->\n    </div>\n</div>\n");
$templateCache.put("templates/directives/user_message.html","<div class=\"item-text-wrap\" ng-class=\"{\n    \'chat-message\': message.user.id != user.id,\n    \'chat-message-self\': message.user.id == user.id,\n    \'same-last-user\': message.user.id == messages[$index - 1].user.id,\n    \'pending\': message.id == undefined\n}\"  id=\"message-{{message.id}}\">\n    <div class=\"avatar\">\n        <img ng-click=\'viewUser(message.user)\' class=\"profile-image\" preload-image=\"{{message.user.image_url}}\" alt=\"foto perfil do usuario\">\n    </div>\n    <div on-hold=\'messageOptions(message)\' ng-class=\"{\n        \'chat-bubble\': message.user.id != user.id,\n        \'chat-bubble-self\': message.user.id == user.id\n    }\">\n        <h2 class=\"c-username\" ng-style=\"{\n        \'color\': getUserColor(message.user.id)\n        }\">\n            <span class=\"username\" ng-if=\'message.user.id != 1\'>{{::message.user.username}}</span>\n        </h2>\n        <p compile=\"::message.compiled_content\"></p>\n        <span class=\"timestamp\" >{{::message.created_at | date:\'HH:mm\'}}</span>\n    </div>\n    <div class=\"like-button\" ng-click=\'toggleLike(message)\'>\n        <i class=\"icon\" ng-class=\'{\n        \"ion-ios-heart-outline\": !message.liked,\n        \"ion-ios-heart\": message.liked\n    }\'></i>\n        <p class=\"counter-like\">{{message.count_likes}}</p>\n    </div>\n</div>\n");}]);