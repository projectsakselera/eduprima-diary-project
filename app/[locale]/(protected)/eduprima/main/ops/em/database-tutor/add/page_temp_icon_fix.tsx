                    <div className="flex-shrink-0 relative">
                      {/* Original step icon - SELALU TAMPIL */}
                      <Icon 
                        icon={step.icon}
                        className={cn(
                          "h-6 w-6",
                          {
                            "text-primary-foreground": stepStatus === 'active',
                            "text-emerald-600 dark:text-emerald-400": stepStatus === 'success',
                            "text-amber-600 dark:text-amber-400": stepStatus === 'warning',
                            "text-slate-500 dark:text-slate-400": stepStatus === 'pending',
                          }
                        )} 
                      />
                      
                      {/* Status indicator overlay - TAMBAHAN */}
                      {stepStatus === 'success' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:check-circle-fill" 
                            className="h-4 w-4 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'warning' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:warning-circle-fill" 
                            className="h-4 w-4 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                      {stepStatus === 'active' && (
                        <div className="absolute -top-1 -right-1">
                          <Icon 
                            icon="ph:circle-fill" 
                            className="h-4 w-4 text-primary bg-white dark:bg-slate-900 rounded-full" 
                          />
                        </div>
                      )}
                    </div>
